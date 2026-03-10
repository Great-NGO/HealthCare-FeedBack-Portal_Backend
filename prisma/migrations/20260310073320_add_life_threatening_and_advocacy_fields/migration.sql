-- AlterTable
ALTER TABLE "feedback_submissions" ADD COLUMN     "advocacy_contact_area" TEXT,
ADD COLUMN     "advocacy_contact_email" TEXT,
ADD COLUMN     "advocacy_contact_name" TEXT,
ADD COLUMN     "advocacy_contact_phone" TEXT,
ADD COLUMN     "life_threatening" TEXT,
ADD COLUMN     "needs_advocacy" TEXT,
ADD COLUMN     "use_preference_advocacy" BOOLEAN,
ADD COLUMN     "use_preference_anonymise" BOOLEAN;
