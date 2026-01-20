import { prisma } from "../config/prisma.js";
import { notFoundError } from "../middleware/errorHandler.js";
import type { FeedbackSubmission, FeedbackEvidence, FeedbackStatus, FeedbackType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { emailService } from "./email.service.js";

/**
 * Feedback filter options
 */
interface FeedbackFilters {
  type?: FeedbackType | "all";
  status?: FeedbackStatus | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Create feedback DTO
 */
interface CreateFeedbackDto {
  anonymous: boolean;
  reporter_name?: string | null;
  reporter_email?: string | null;
  reporter_phone?: string | null;
  reporter_type?: string | null;
  reporter_relationship?: string | null;
  reporter_gender?: string | null;
  reporter_age_range?: string | null;
  reporter_disability_status?: string | null;
  reporter_income_range?: string | null;
  reporter_education_level?: string | null;
  reporter_region?: string | null;
  reporter_marital_status?: string | null;
  reporter_geographic_setting?: string | null;
  reporter_insurance_coverage?: string | null;
  reporter_healthcare_frequency?: string | null;
  reporter_sexuality?: string | null;
  feedback_type: FeedbackType;
  facility_type?: string | null;
  facility_state?: string | null;
  facility_lga?: string | null;
  facility_name?: string | null;
  incident_date?: string | null;
  incident_time?: string | null;
  department?: string | null;
  location?: string | null;
  staff_involved?: string | null;
  witnesses?: string | null;
  description: string;
  severity?: number | null;
  voice_message_url?: string | null;
  voice_message_duration?: number | null;
  voice_transcription?: string | null;
  additional_comments?: string | null;
}

/**
 * Update feedback DTO (admin)
 */
interface UpdateFeedbackDto {
  status?: FeedbackStatus;
  admin_notes?: string | null;
  assigned_department?: string | null;
}

/**
 * Feedback service
 * Handles all feedback-related database operations via Prisma
 */
export const feedbackService = {
  /**
   * Generates a unique reference ID for feedback
   * Format: FB-YYYYMMDD-XXXXX (e.g., FB-20260120-A3B7C)
   */
  generateReferenceId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `FB-${dateStr}-${randomPart}`;
  },

  /**
   * Creates a new feedback submission and sends notification emails
   */
  async create(data: CreateFeedbackDto): Promise<FeedbackSubmission & { emailStatus?: { confirmationSent: boolean; followupSent: boolean; adminNotificationSent: boolean } }> {
    const surveyToken = uuidv4();
    const referenceId = this.generateReferenceId();

    const feedback = await prisma.feedbackSubmission.create({
      data: {
        ...data,
        reference_id: referenceId,
        incident_date: data.incident_date ? new Date(data.incident_date) : null,
        survey_token: surveyToken,
      },
    });

    // Send emails if reporter provided an email address
    let emailStatus: { confirmationSent: boolean; followupSent: boolean; adminNotificationSent: boolean } | undefined;
    
    if (data.reporter_email && !data.anonymous) {
      try {
        emailStatus = await emailService.sendFeedbackEmails({
          email: data.reporter_email,
          referenceId: feedback.reference_id,
          feedbackId: feedback.id,
          surveyToken: surveyToken,
          feedbackType: data.feedback_type,
        });
        console.log(`Feedback emails sent for ${referenceId}:`, emailStatus);
      } catch (error) {
        console.error(`Failed to send feedback emails for ${referenceId}:`, error);
        // Don't fail the feedback creation if emails fail
      }
    } else {
      // Still notify admins even for anonymous feedback
      try {
        await emailService.sendAdminNotification({
          referenceId: feedback.reference_id,
          feedbackType: data.feedback_type,
          feedbackId: feedback.id,
        });
      } catch (error) {
        console.error(`Failed to send admin notification for ${referenceId}:`, error);
      }
    }

    return { ...feedback, emailStatus };
  },

  /**
   * Gets a single feedback by ID
   */
  async getById(id: string): Promise<FeedbackSubmission> {
    const feedback = await prisma.feedbackSubmission.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw notFoundError("Feedback submission");
    }

    return feedback;
  },

  /**
   * Gets a single feedback by reference ID
   */
  async getByReferenceId(referenceId: string): Promise<FeedbackSubmission> {
    const feedback = await prisma.feedbackSubmission.findUnique({
      where: { reference_id: referenceId },
    });

    if (!feedback) {
      throw notFoundError("Feedback submission");
    }

    return feedback;
  },

  /**
   * Lists feedback submissions with filters and pagination
   */
  async list(filters: FeedbackFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "desc";

    // Build where clause
    const where: any = {};

    if (filters.type && filters.type !== "all") {
      where.feedback_type = filters.type;
    }

    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters.dateFrom) {
      where.created_at = {
        ...where.created_at,
        gte: new Date(filters.dateFrom),
      };
    }

    if (filters.dateTo) {
      where.created_at = {
        ...where.created_at,
        lte: new Date(`${filters.dateTo}T23:59:59`),
      };
    }

    if (filters.search) {
      where.OR = [
        { reference_id: { contains: filters.search, mode: "insensitive" } },
        { reporter_name: { contains: filters.search, mode: "insensitive" } },
        { facility_name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Execute queries in parallel
    const [feedback, total] = await Promise.all([
      prisma.feedbackSubmission.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.feedbackSubmission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Updates a feedback submission (admin)
   * Sends case closed email if status changes to 'closed'
   */
  async update(id: string, data: UpdateFeedbackDto): Promise<FeedbackSubmission & { caseClosedEmailSent?: boolean }> {
    // Get existing feedback to check for status change
    const existingFeedback = await this.getById(id);

    const feedback = await prisma.feedbackSubmission.update({
      where: { id },
      data,
    });

    // Send case closed email if status changed to 'closed' and reporter has email
    let caseClosedEmailSent: boolean | undefined;
    if (
      data.status === "closed" &&
      existingFeedback.status !== "closed" &&
      feedback.reporter_email &&
      !feedback.anonymous
    ) {
      try {
        caseClosedEmailSent = await emailService.sendCaseClosedEmail({
          email: feedback.reporter_email,
          referenceId: feedback.reference_id,
        });
        console.log(`Case closed email sent for ${feedback.reference_id}: ${caseClosedEmailSent}`);
      } catch (error) {
        console.error(`Failed to send case closed email for ${feedback.reference_id}:`, error);
        caseClosedEmailSent = false;
      }
    }

    return { ...feedback, caseClosedEmailSent };
  },

  /**
   * Gets dashboard statistics
   */
  async getStats(dateFrom?: string, dateTo?: string) {
    const where: any = {};

    if (dateFrom) {
      where.created_at = { gte: new Date(dateFrom) };
    }

    if (dateTo) {
      where.created_at = {
        ...where.created_at,
        lte: new Date(`${dateTo}T23:59:59`),
      };
    }

    const items = await prisma.feedbackSubmission.findMany({
      where,
      select: {
        id: true,
        feedback_type: true,
        status: true,
        created_at: true,
      },
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let newThisWeek = 0;

    for (const item of items) {
      // Count by type
      byType[item.feedback_type] = (byType[item.feedback_type] || 0) + 1;

      // Count by status
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;

      // Count new this week
      if (item.created_at >= weekAgo) {
        newThisWeek++;
      }
    }

    return {
      total: items.length,
      byType,
      byStatus,
      newThisWeek,
    };
  },

  /**
   * Gets evidence files for a feedback
   */
  async getEvidence(feedbackId: string): Promise<FeedbackEvidence[]> {
    const evidence = await prisma.feedbackEvidence.findMany({
      where: { feedback_id: feedbackId },
      orderBy: { created_at: "desc" },
    });

    return evidence;
  },
};
