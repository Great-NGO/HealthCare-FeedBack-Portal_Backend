import type { AppRole, FacilityStatus, FeedbackStatus, FeedbackType, PendingEntryStatus } from "./enums.js";

/**
 * Admin user model
 */
export interface Admin {
  id: string;
  email: string;
  password_hash: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean | null;
  created_at: string | null;
  created_by: string | null;
}

/**
 * Custom facility model
 */
export interface CustomFacility {
  id: string;
  name: string;
  facility_type: string;
  state: string;
  lga: string;
  status: FacilityStatus | null;
  created_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

/**
 * Feedback evidence/attachment model
 */
export interface FeedbackEvidence {
  id: string;
  feedback_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

/**
 * Main feedback submission model
 */
export interface FeedbackSubmission {
  id: string;
  reference_id: string;
  anonymous: boolean;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  reporter_type: string | null;
  reporter_relationship: string | null;
  reporter_gender: string | null;
  reporter_age_range: string | null;
  reporter_disability_status: string | null;
  reporter_income_range: string | null;
  reporter_education_level: string | null;
  reporter_region: string | null;
  reporter_marital_status: string | null;
  reporter_geographic_setting: string | null;
  reporter_insurance_coverage: string | null;
  reporter_healthcare_frequency: string | null;
  reporter_sexuality: string | null;
  feedback_type: FeedbackType;
  facility_type: string | null;
  facility_state: string | null;
  facility_lga: string | null;
  facility_name: string | null;
  incident_date: string | null;
  incident_time: string | null;
  department: string | null;
  location: string | null;
  staff_involved: string | null;
  witnesses: string | null;
  description: string;
  severity: number | null;
  voice_message_url: string | null;
  voice_message_duration: number | null;
  voice_transcription: string | null;
  additional_comments: string | null;
  survey_token: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  assigned_department: string | null;
  confirmation_email_sent: boolean | null;
  followup_email_sent: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * Pending entry model (for custom values like sexuality)
 */
export interface PendingEntry {
  id: string;
  entry_type: string;
  value: string;
  feedback_id: string | null;
  facility_type: string | null;
  state: string | null;
  lga: string | null;
  status: PendingEntryStatus | null;
  created_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

/**
 * Survey response model
 */
export interface SurveyResponse {
  id: string;
  feedback_id: string | null;
  overall_satisfaction: number | null;
  staff_friendliness: number | null;
  communication: number | null;
  cleanliness: number | null;
  wait_time: number | null;
  would_recommend: boolean | null;
  comments: string | null;
  created_at: string;
}

/**
 * User role assignment model
 */
export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
