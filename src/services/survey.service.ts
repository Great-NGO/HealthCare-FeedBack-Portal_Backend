import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type { SurveyResponse } from "@prisma/client";

/**
 * Submit survey DTO
 */
interface SubmitSurveyDto {
  token: string;
  overall_satisfaction?: number | null;
  staff_friendliness?: number | null;
  communication?: number | null;
  cleanliness?: number | null;
  wait_time?: number | null;
  would_recommend?: boolean | null;
  comments?: string | null;
}

/**
 * Survey service using Prisma
 * Handles survey response operations
 */
export const surveyService = {
  /**
   * Submits a survey response
   */
  async submit(data: SubmitSurveyDto): Promise<SurveyResponse> {
    // Find feedback by survey token
    const feedback = await prisma.feedbackSubmission.findUnique({
      where: { survey_token: data.token },
      select: { id: true },
    });

    if (!feedback) {
      throw new AppError(400, "INVALID_TOKEN", "Invalid or expired survey token");
    }

    // Check if survey already submitted
    const existingSurvey = await prisma.surveyResponse.findUnique({
      where: { feedback_id: feedback.id },
      select: { id: true },
    });

    if (existingSurvey) {
      throw new AppError(400, "ALREADY_SUBMITTED", "Survey has already been submitted");
    }

    // Create survey response
    const survey = await prisma.surveyResponse.create({
      data: {
        feedback_id: feedback.id,
        overall_satisfaction: data.overall_satisfaction,
        staff_friendliness: data.staff_friendliness,
        communication: data.communication,
        cleanliness: data.cleanliness,
        wait_time: data.wait_time,
        would_recommend: data.would_recommend,
        comments: data.comments,
      },
    });

    return survey;
  },

  /**
   * Gets survey by feedback ID
   */
  async getByFeedbackId(feedbackId: string): Promise<SurveyResponse | null> {
    const survey = await prisma.surveyResponse.findUnique({
      where: { feedback_id: feedbackId },
    });

    return survey;
  },

  /**
   * Validates a survey token (checks if feedback exists and survey not yet submitted)
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    feedbackId?: string;
    alreadySubmitted: boolean;
  }> {
    // Find feedback by survey token
    const feedback = await prisma.feedbackSubmission.findUnique({
      where: { survey_token: token },
      select: { id: true },
    });

    if (!feedback) {
      return { valid: false, alreadySubmitted: false };
    }

    // Check if survey already submitted
    const existingSurvey = await prisma.surveyResponse.findUnique({
      where: { feedback_id: feedback.id },
      select: { id: true },
    });

    return {
      valid: true,
      feedbackId: feedback.id,
      alreadySubmitted: !!existingSurvey,
    };
  },
};
