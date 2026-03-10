-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('admin', 'moderator', 'user', 'super_admin');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('new', 'in_review', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('complaint', 'concern', 'compliment', 'safety_incident', 'comment');

-- CreateEnum
CREATE TYPE "PendingEntryStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "FacilityStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "FacilityOwnershipType" AS ENUM ('federal', 'state', 'private', 'unknown');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "full_name" TEXT,
    "role" "AppRole" NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_submissions" (
    "id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "reporter_name" TEXT,
    "reporter_email" TEXT,
    "reporter_phone" TEXT,
    "reporter_type" TEXT,
    "reporting_for_self" BOOLEAN,
    "reporter_relationship" TEXT,
    "reporter_organization" TEXT,
    "reporter_gender" TEXT,
    "reporter_age_range" TEXT,
    "reporter_disability_status" TEXT,
    "reporter_income_range" TEXT,
    "reporter_education_level" TEXT,
    "reporter_region" TEXT,
    "reporter_marital_status" TEXT,
    "reporter_geographic_setting" TEXT,
    "reporter_insurance_coverage" TEXT,
    "reporter_healthcare_frequency" TEXT,
    "reporter_sexuality" TEXT,
    "patient_name" TEXT,
    "patient_email" TEXT,
    "patient_phone" TEXT,
    "feedback_type" "FeedbackType" NOT NULL,
    "facility_type" TEXT,
    "facility_state" TEXT,
    "facility_lga" TEXT,
    "facility_name" TEXT,
    "incident_date" TIMESTAMP(3),
    "incident_time" TEXT,
    "department" TEXT,
    "location" TEXT,
    "staff_involved" TEXT,
    "witnesses" TEXT,
    "description" TEXT NOT NULL,
    "severity" INTEGER,
    "issue_classification" TEXT,
    "issue_classification_other" TEXT,
    "voice_message_url" TEXT,
    "voice_message_duration" INTEGER,
    "voice_transcription" TEXT,
    "voice_language" TEXT,
    "additional_comments" TEXT,
    "survey_token" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,
    "assigned_department" TEXT,
    "confirmation_email_sent" BOOLEAN NOT NULL DEFAULT false,
    "followup_email_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_evidence" (
    "id" TEXT NOT NULL,
    "feedback_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "feedback_id" TEXT,
    "overall_satisfaction" INTEGER,
    "staff_friendliness" INTEGER,
    "communication" INTEGER,
    "cleanliness" INTEGER,
    "wait_time" INTEGER,
    "would_recommend" BOOLEAN,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facility_type" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "status" "FacilityStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "custom_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_entries" (
    "id" TEXT NOT NULL,
    "entry_type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "feedback_id" TEXT,
    "facility_type" TEXT,
    "state" TEXT,
    "lga" TEXT,
    "status" "PendingEntryStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "pending_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "AppRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognized_ngos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recognized_ngos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facilities" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "facility_name" TEXT NOT NULL,
    "ownership_type" "FacilityOwnershipType" NOT NULL DEFAULT 'unknown',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "health_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_password_reset_token_idx" ON "admins"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_submissions_reference_id_key" ON "feedback_submissions"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_submissions_survey_token_key" ON "feedback_submissions"("survey_token");

-- CreateIndex
CREATE INDEX "feedback_submissions_reference_id_idx" ON "feedback_submissions"("reference_id");

-- CreateIndex
CREATE INDEX "feedback_submissions_status_idx" ON "feedback_submissions"("status");

-- CreateIndex
CREATE INDEX "feedback_submissions_created_at_idx" ON "feedback_submissions"("created_at");

-- CreateIndex
CREATE INDEX "feedback_submissions_feedback_type_idx" ON "feedback_submissions"("feedback_type");

-- CreateIndex
CREATE INDEX "feedback_evidence_feedback_id_idx" ON "feedback_evidence"("feedback_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_feedback_id_key" ON "survey_responses"("feedback_id");

-- CreateIndex
CREATE INDEX "custom_facilities_status_idx" ON "custom_facilities"("status");

-- CreateIndex
CREATE INDEX "custom_facilities_state_lga_idx" ON "custom_facilities"("state", "lga");

-- CreateIndex
CREATE INDEX "pending_entries_status_idx" ON "pending_entries"("status");

-- CreateIndex
CREATE INDEX "pending_entries_entry_type_idx" ON "pending_entries"("entry_type");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "recognized_ngos_name_key" ON "recognized_ngos"("name");

-- CreateIndex
CREATE INDEX "recognized_ngos_name_idx" ON "recognized_ngos"("name");

-- CreateIndex
CREATE INDEX "health_facilities_state_idx" ON "health_facilities"("state");

-- CreateIndex
CREATE INDEX "health_facilities_state_lga_idx" ON "health_facilities"("state", "lga");

-- CreateIndex
CREATE INDEX "health_facilities_state_lga_facility_name_idx" ON "health_facilities"("state", "lga", "facility_name");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_evidence" ADD CONSTRAINT "feedback_evidence_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_entries" ADD CONSTRAINT "pending_entries_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
