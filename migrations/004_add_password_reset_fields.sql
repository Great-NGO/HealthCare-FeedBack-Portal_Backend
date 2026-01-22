-- Migration: Add password reset token fields to admins table
-- Description: Enables password reset functionality for admin users
-- Date: 2026-01-20

-- Add password reset token and expiration fields
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN admins.password_reset_token IS 'Token for password reset requests';
COMMENT ON COLUMN admins.password_reset_expires IS 'Expiration timestamp for password reset token';

-- Create index on password_reset_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_password_reset_token ON admins(password_reset_token);
