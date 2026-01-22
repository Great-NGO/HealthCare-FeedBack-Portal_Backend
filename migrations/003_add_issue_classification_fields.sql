-- Migration: Add issue_classification and issue_classification_other columns to feedback_submissions table
-- Description: Stores issue classification for complaints/concerns and safety incidents
-- Date: 2026-01-19

-- Add issue_classification column
ALTER TABLE feedback_submissions 
ADD COLUMN IF NOT EXISTS issue_classification VARCHAR(500);

-- Add issue_classification_other column
ALTER TABLE feedback_submissions 
ADD COLUMN IF NOT EXISTS issue_classification_other VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN feedback_submissions.issue_classification IS 'Main issue classification selected from predefined list';
COMMENT ON COLUMN feedback_submissions.issue_classification_other IS 'Specification when "Other" is selected as issue classification';

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_issue_classification ON feedback_submissions(issue_classification);
