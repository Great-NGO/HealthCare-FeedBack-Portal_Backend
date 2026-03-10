-- AlterTable
ALTER TABLE "feedback_submissions"
ADD COLUMN     "partner_id" TEXT,
ADD COLUMN     "referral_session_id" TEXT,
ADD COLUMN     "referral_link_id" TEXT;

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_referral_links" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_prefix" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_referral_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_credits" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "feedback_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_slug_key" ON "partners"("slug");

-- CreateIndex
CREATE INDEX "partners_slug_idx" ON "partners"("slug");

-- CreateIndex
CREATE INDEX "partners_is_active_idx" ON "partners"("is_active");

-- CreateIndex
CREATE INDEX "referral_sessions_starts_at_idx" ON "referral_sessions"("starts_at");

-- CreateIndex
CREATE INDEX "referral_sessions_ends_at_idx" ON "referral_sessions"("ends_at");

-- CreateIndex
CREATE INDEX "referral_sessions_is_active_idx" ON "referral_sessions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "partner_referral_links_token_hash_key" ON "partner_referral_links"("token_hash");

-- CreateIndex
CREATE INDEX "partner_referral_links_partner_id_idx" ON "partner_referral_links"("partner_id");

-- CreateIndex
CREATE INDEX "partner_referral_links_session_id_idx" ON "partner_referral_links"("session_id");

-- CreateIndex
CREATE INDEX "partner_referral_links_revoked_at_idx" ON "partner_referral_links"("revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "referral_credits_feedback_id_key" ON "referral_credits"("feedback_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_credits_partner_id_session_id_email_hash_key" ON "referral_credits"("partner_id", "session_id", "email_hash");

-- CreateIndex
CREATE INDEX "referral_credits_partner_id_idx" ON "referral_credits"("partner_id");

-- CreateIndex
CREATE INDEX "referral_credits_session_id_idx" ON "referral_credits"("session_id");

-- CreateIndex
CREATE INDEX "feedback_submissions_partner_id_idx" ON "feedback_submissions"("partner_id");

-- CreateIndex
CREATE INDEX "feedback_submissions_referral_session_id_idx" ON "feedback_submissions"("referral_session_id");

-- CreateIndex
CREATE INDEX "feedback_submissions_referral_link_id_idx" ON "feedback_submissions"("referral_link_id");

-- AddForeignKey
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_referral_session_id_fkey" FOREIGN KEY ("referral_session_id") REFERENCES "referral_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_referral_link_id_fkey" FOREIGN KEY ("referral_link_id") REFERENCES "partner_referral_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_referral_links" ADD CONSTRAINT "partner_referral_links_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_referral_links" ADD CONSTRAINT "partner_referral_links_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "referral_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_credits" ADD CONSTRAINT "referral_credits_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_credits" ADD CONSTRAINT "referral_credits_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "referral_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_credits" ADD CONSTRAINT "referral_credits_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

