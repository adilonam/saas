-- Drop waitlist position; subscription is the only access gate
ALTER TABLE "User" DROP COLUMN "waitlistNumber";
