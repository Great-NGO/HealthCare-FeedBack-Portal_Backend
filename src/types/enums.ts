/**
 * Application role types
 */
export const AppRole = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];

/**
 * Feedback status types
 */
export const FeedbackStatus = {
  NEW: "new",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type FeedbackStatus = (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

/**
 * Feedback type categories
 */
export const FeedbackType = {
  COMPLAINT: "complaint",
  CONCERN: "concern",
  COMPLIMENT: "compliment",
  SAFETY_INCIDENT: "safety_incident",
  COMMENT: "comment",
} as const;

export type FeedbackType = (typeof FeedbackType)[keyof typeof FeedbackType];

/**
 * Pending entry status
 */
export const PendingEntryStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PendingEntryStatus = (typeof PendingEntryStatus)[keyof typeof PendingEntryStatus];

/**
 * Custom facility status
 */
export const FacilityStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type FacilityStatus = (typeof FacilityStatus)[keyof typeof FacilityStatus];
