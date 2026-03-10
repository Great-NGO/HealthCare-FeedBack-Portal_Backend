import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { config } from "../config/env.js";
import { AppError, notFoundError, conflictError } from "../middleware/errorHandler.js";

const sha256Hex = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

async function getCurrentPublicSessionId(): Promise<string | null> {
  const now = new Date();
  const session = await prisma.referralSession.findFirst({
    where: {
      is_active: true,
      starts_at: { lte: now },
      ends_at: { gte: now },
    },
    orderBy: { starts_at: "desc" },
    select: { id: true },
  });
  return session?.id ?? null;
}

async function getAdminActiveSessionId(): Promise<string | null> {
  const session = await prisma.referralSession.findFirst({
    where: { is_active: true },
    orderBy: { created_at: "desc" },
    select: { id: true, starts_at: true, ends_at: true },
  });
  return session?.id ?? null;
}

export const referralsService = {
  async createPartner(input: { display_name: string; slug: string }) {
    const slug = input.slug.trim().toLowerCase();
    const displayName = input.display_name.trim();

    try {
      return await prisma.partner.create({
        data: { display_name: displayName, slug },
        select: { id: true, display_name: true, slug: true, is_active: true, created_at: true },
      });
    } catch (e) {
      if (e instanceof AppError) throw e;
      // Prisma unique violation becomes a conflict
      throw conflictError("Partner slug already exists");
    }
  },

  async updatePartner(id: string, input: { display_name?: string; slug?: string; is_active?: boolean }) {
    const existing = await prisma.partner.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw notFoundError("Partner");

    const data: { display_name?: string; slug?: string; is_active?: boolean } = {};
    if (typeof input.display_name === "string") data.display_name = input.display_name.trim();
    if (typeof input.slug === "string") data.slug = input.slug.trim().toLowerCase();
    if (typeof input.is_active === "boolean") data.is_active = input.is_active;

    try {
      return await prisma.partner.update({
        where: { id },
        data,
        select: { id: true, display_name: true, slug: true, is_active: true, created_at: true },
      });
    } catch {
      throw conflictError("Partner slug already exists");
    }
  },

  async listPartnersWithCurrentScore() {
    const sessionId = await getCurrentPublicSessionId();
    const partners = await prisma.partner.findMany({
      orderBy: { created_at: "asc" },
      select: { id: true, display_name: true, slug: true, is_active: true, created_at: true },
    });

    if (!sessionId) {
      return partners.map((p) => ({ ...p, score: 0 }));
    }

    const scores = await prisma.referralCredit.groupBy({
      by: ["partner_id"],
      where: { session_id: sessionId },
      _count: { id: true },
    });
    const scoreMap = new Map(scores.map((s) => [s.partner_id, s._count.id]));

    return partners.map((p) => ({ ...p, score: scoreMap.get(p.id) ?? 0 }));
  },

  async createSession(input: { name: string; starts_at: string; ends_at: string }) {
    const startsAt = new Date(input.starts_at);
    const endsAt = new Date(input.ends_at);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid starts_at or ends_at");
    }
    if (endsAt <= startsAt) {
      throw new AppError(400, "VALIDATION_ERROR", "ends_at must be after starts_at");
    }

    return await prisma.referralSession.create({
      data: {
        name: input.name.trim(),
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: true,
      },
      select: { id: true, name: true, starts_at: true, ends_at: true, is_active: true, created_at: true },
    });
  },

  async listSessions() {
    return await prisma.referralSession.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, name: true, starts_at: true, ends_at: true, is_active: true, created_at: true },
    });
  },

  async activateSession(id: string) {
    const existing = await prisma.referralSession.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw notFoundError("Referral session");

    await prisma.$transaction([
      prisma.referralSession.updateMany({ data: { is_active: false } }),
      prisma.referralSession.update({ where: { id }, data: { is_active: true } }),
    ]);

    return await prisma.referralSession.findUnique({
      where: { id },
      select: { id: true, name: true, starts_at: true, ends_at: true, is_active: true, created_at: true },
    });
  },

  async generatePartnerLink(partnerId: string) {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, slug: true, is_active: true },
    });
    if (!partner) throw notFoundError("Partner");
    if (!partner.is_active) throw new AppError(400, "VALIDATION_ERROR", "Partner is not active");

    const sessionId = await getAdminActiveSessionId();
    if (!sessionId) throw new AppError(400, "VALIDATION_ERROR", "No active referral session");

    const token = crypto.randomBytes(24).toString("base64url");
    const tokenHash = sha256Hex(token);
    const tokenPrefix = token.slice(0, 8);

    const link = await prisma.partnerReferralLink.create({
      data: {
        partner_id: partner.id,
        session_id: sessionId,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
      },
      select: { id: true, partner_id: true, session_id: true, token_prefix: true, revoked_at: true, created_at: true },
    });

    const url = `${config.corsOrigin}/?ref=${encodeURIComponent(partner.slug)}&t=${encodeURIComponent(token)}`;

    return { ...link, url, token };
  },

  async revokeLink(id: string) {
    const link = await prisma.partnerReferralLink.findUnique({ where: { id }, select: { id: true } });
    if (!link) throw notFoundError("Referral link");

    return await prisma.partnerReferralLink.update({
      where: { id },
      data: { revoked_at: new Date() },
      select: { id: true, partner_id: true, session_id: true, token_prefix: true, revoked_at: true, created_at: true },
    });
  },

  async getPublicLeaderboard() {
    const sessionId = await getCurrentPublicSessionId();
    if (!sessionId) return [];

    const scores = await prisma.referralCredit.groupBy({
      by: ["partner_id"],
      where: { session_id: sessionId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const partnerIds = scores.map((s) => s.partner_id);
    const partners = await prisma.partner.findMany({
      where: { id: { in: partnerIds }, is_active: true },
      select: { id: true, display_name: true },
    });
    const partnerMap = new Map(partners.map((p) => [p.id, p.display_name]));

    return scores
      .filter((s) => partnerMap.has(s.partner_id))
      .map((s) => ({
        partnerId: s.partner_id,
        displayName: partnerMap.get(s.partner_id)!,
        score: s._count.id,
      }));
  },
};

