-- Migration: Add reporting_for_self and reporter_organization to feedback_submissions
-- Description: Store whether Patient/Carer reports for self vs other; store NGO/Legal Officer org separately
-- Date: 2026-02-12

-- Add reporting_for_self (Patient/Carer only: true = self, false = someone else)
ALTER TABLE feedback_submissions
ADD COLUMN IF NOT EXISTS reporting_for_self BOOLEAN;

-- Add reporter_organization (NGO/Legal Officer: organization or department name)
ALTER TABLE feedback_submissions
ADD COLUMN IF NOT EXISTS reporter_organization VARCHAR(255);

COMMENT ON COLUMN feedback_submissions.reporting_for_self IS 'For Patient/Carer: true = reporting for self, false = reporting for someone else';
COMMENT ON COLUMN feedback_submissions.reporter_organization IS 'For NGO/Legal Officer: organization name or department/agency';
