-- Migration: Add password_hash column to admins table
-- Description: Stores bcrypt-hashed passwords for JWT-based authentication
-- Date: 2026-01-19

-- Add password_hash column to admins table
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN admins.password_hash IS 'Bcrypt-hashed password for JWT authentication';

-- Optional: Create index on email for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Note: After running this migration, you need to set passwords for existing admins
-- You can use the following endpoint: POST /api/v1/auth/set-password
-- Or manually hash passwords using bcrypt and update the database
