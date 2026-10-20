-- Replace the single-value BookingStatus enum with a real lifecycle.
-- A booking is only "confirmed" once the deposit is actually paid; an
-- abandoned or failed payment becomes "cancelled".
ALTER TABLE "BookingRequest" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";

CREATE TYPE "BookingStatus" AS ENUM ('pending_payment', 'confirmed', 'cancelled');

ALTER TABLE "BookingRequest"
  ALTER COLUMN "status" TYPE "BookingStatus"
  USING (
    CASE "status"::text
      WHEN 'pending' THEN 'pending_payment'
      ELSE "status"::text
    END
  )::"BookingStatus";

ALTER TABLE "BookingRequest" ALTER COLUMN "status" SET DEFAULT 'pending_payment';

DROP TYPE "BookingStatus_old";
