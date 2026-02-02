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
  issue_classification?: string | null;
  issue_classification_other?: string | null;
  voice_message_url?: string | null;
  voice_message_duration?: number | null;
  voice_transcription?: string | null;
  voice_language?: string | null;
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
   * Also creates pending entries for custom "Others" values
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

    // Create pending entries for custom "Others" values
    const pendingEntriesToCreate: Array<{
      entry_type: string;
      value: string;
      feedback_id: string;
      facility_type?: string | null;
      state?: string | null;
      lga?: string | null;
    }> = [];

    // Check for custom facility name (verify if it exists in health_facilities table)
    if (data.facility_name && data.facility_state && data.facility_lga) {
      try {
        const existingFacility = await prisma.healthFacility.findFirst({
          where: {
            facility_name: { equals: data.facility_name, mode: 'insensitive' },
            state: { equals: data.facility_state, mode: 'insensitive' },
            lga: { equals: data.facility_lga, mode: 'insensitive' },
          },
        });

        // Only create pending entry if facility doesn't exist in predefined list
        if (!existingFacility) {
          pendingEntriesToCreate.push({
            entry_type: 'facility',
            value: data.facility_name,
            feedback_id: feedback.id,
            facility_type: data.facility_type,
            state: data.facility_state,
            lga: data.facility_lga,
          });
        }
      } catch (error) {
        console.error('Error checking facility existence:', error);
        // If check fails, create pending entry to be safe
        pendingEntriesToCreate.push({
          entry_type: 'facility',
          value: data.facility_name,
          feedback_id: feedback.id,
          facility_type: data.facility_type,
          state: data.facility_state,
          lga: data.facility_lga,
        });
      }
    }

    // Check for custom department (if not in predefined list)
    const predefinedDepartments = [
      'Emergency', 'Outpatient', 'Inpatient', 'Surgery', 'Maternity', 'Paediatrics',
      'Radiology', 'Laboratory', 'Pharmacy', 'Administration', 'Mental Health',
      'Rehabilitation', 'ICU', 'Orthopaedics', 'Cardiology', 'Oncology', 'Dental',
      'ENT', 'Ophthalmology', 'Gynaecology', 'Anaesthesiology', 'General Ward', 'Other'
    ];
    if (data.department && !predefinedDepartments.includes(data.department)) {
      pendingEntriesToCreate.push({
        entry_type: 'department',
        value: data.department,
        feedback_id: feedback.id,
      });
    }

    // Check for custom location (if not in predefined list)
    const predefinedLocations = [
      'Reception', 'Waiting Area', 'Consultation Room', 'Ward', 'Operating Theatre',
      'Pharmacy', 'Laboratory', 'Radiology', 'Emergency Room', 'Corridor',
      'Cafeteria', 'Car Park', 'Restroom', 'Nurses Station', 'Doctor\'s Office', 'Other'
    ];
    if (data.location && !predefinedLocations.includes(data.location)) {
      pendingEntriesToCreate.push({
        entry_type: 'location',
        value: data.location,
        feedback_id: feedback.id,
      });
    }

    // Check for custom issue classification other
    if (data.issue_classification_other && data.issue_classification === 'Other') {
      pendingEntriesToCreate.push({
        entry_type: 'issue_classification',
        value: data.issue_classification_other,
        feedback_id: feedback.id,
      });
    }

    // Create all pending entries (skip duplicates)
    if (pendingEntriesToCreate.length > 0) {
      try {
        // Check for existing pending entries to avoid duplicates
        const existingEntries = await prisma.pendingEntry.findMany({
          where: {
            OR: pendingEntriesToCreate.map(entry => ({
              entry_type: entry.entry_type,
              value: { equals: entry.value, mode: 'insensitive' },
              ...(entry.state && entry.lga ? {
                state: { equals: entry.state, mode: 'insensitive' },
                lga: { equals: entry.lga, mode: 'insensitive' },
              } : {}),
            })),
          },
        });

        // Filter out entries that already exist
        const existingValues = new Set(
          existingEntries.map(e => 
            `${e.entry_type}:${e.value.toLowerCase()}:${e.state?.toLowerCase() || ''}:${e.lga?.toLowerCase() || ''}`
          )
        );

        const newEntries = pendingEntriesToCreate.filter(entry => {
          const key = `${entry.entry_type}:${entry.value.toLowerCase()}:${entry.state?.toLowerCase() || ''}:${entry.lga?.toLowerCase() || ''}`;
          return !existingValues.has(key);
        });

        if (newEntries.length > 0) {
          await prisma.pendingEntry.createMany({
            data: newEntries,
          });
          console.log(`Created ${newEntries.length} pending entries for feedback ${referenceId}`);
        } else {
          console.log(`All pending entries already exist for feedback ${referenceId}`);
        }
      } catch (error) {
        console.error(`Failed to create pending entries for ${referenceId}:`, error);
        // Don't fail the feedback creation if pending entries fail
      }
    }

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

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      total,
      newThisWeek,
      byTypeRows,
      byStatusRows,
      byAgeRows,
      byGenderRows,
      byIssueClassificationRows,
      byComplimentDepartmentRows,
    ] =
      await Promise.all([
        prisma.feedbackSubmission.count({ where }),
        prisma.feedbackSubmission.count({
          where: {
            ...where,
            created_at: { ...where.created_at, gte: weekAgo },
          },
        }),
        prisma.feedbackSubmission.groupBy({
          by: ["feedback_type"],
          where,
          _count: { id: true },
        }),
        prisma.feedbackSubmission.groupBy({
          by: ["status"],
          where,
          _count: { id: true },
        }),
        prisma.feedbackSubmission.groupBy({
          by: ["reporter_age_range"],
          where,
          _count: { id: true },
        }),
        prisma.feedbackSubmission.groupBy({
          by: ["reporter_gender"],
          where,
          _count: { id: true },
        }),
        prisma.feedbackSubmission.groupBy({
          by: ["issue_classification"],
          where: {
            ...where,
            issue_classification: { not: null },
          },
          _count: { id: true },
        }),
        prisma.feedbackSubmission.groupBy({
          by: ["department"],
          where: {
            ...where,
            feedback_type: "compliment",
            department: { not: null },
          },
          _count: { id: true },
        }),
      ]);

    const byType: Record<string, number> = {};
    for (const row of byTypeRows) {
      byType[row.feedback_type] = row._count.id;
    }

    const byStatus: Record<string, number> = {};
    for (const row of byStatusRows) {
      byStatus[row.status] = row._count.id;
    }

    const byAgeRange: Record<string, number> = {};
    for (const row of byAgeRows) {
      const key = row.reporter_age_range ?? "Unknown";
      byAgeRange[key] = row._count.id;
    }

    const byGender: Record<string, number> = {};
    for (const row of byGenderRows) {
      const key = row.reporter_gender ?? "Unknown";
      byGender[key] = row._count.id;
    }

    // Get issue classifications sorted by frequency (frontends can choose how many to display)
    const byIssueClassification: Array<{ classification: string; count: number }> = [];
    for (const row of byIssueClassificationRows) {
      if (row.issue_classification) {
        byIssueClassification.push({
          classification: row.issue_classification,
          count: row._count.id,
        });
      }
    }
    // Sort by count descending; caller decides how many to use (top 3, 5, 10, etc.)
    const top3Themes = byIssueClassification.sort((a, b) => b.count - a.count);

    const byComplimentDepartment: Array<{ classification: string; count: number }> = [];
    for (const row of byComplimentDepartmentRows) {
      if (row.department) {
        byComplimentDepartment.push({
          classification: row.department,
          count: row._count.id,
        });
      }
    }
    const topComplimentThemes = byComplimentDepartment.sort((a, b) => b.count - a.count);

    return {
      total,
      byType,
      byStatus,
      byAgeRange,
      byGender,
      newThisWeek,
      top3Themes,
      topComplimentThemes,
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
