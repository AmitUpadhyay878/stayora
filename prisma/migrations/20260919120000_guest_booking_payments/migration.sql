-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'deposit_paid', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable: add guest + payment columns
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "reference" TEXT,
ADD COLUMN IF NOT EXISTS "guest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "totalAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "depositAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "balanceAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT,
ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT,
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- Backfill references for any existing rows (id is unique, so md5 is unique)
UPDATE "BookingRequest" SET "reference" = 'STY-' || upper(substr(md5("id"), 1, 8)) WHERE "reference" IS NULL;
ALTER TABLE "BookingRequest" ALTER COLUMN "reference" SET NOT NULL;

-- Allow guest bookings (no account required)
ALTER TABLE "BookingRequest" DROP CONSTRAINT IF EXISTS "BookingRequest_userId_fkey";
ALTER TABLE "BookingRequest" ALTER COLUMN "userId" DROP NOT NULL;
DO $$ BEGIN
  ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BookingRequest_reference_key" ON "BookingRequest"("reference");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BookingRequest_email_idx" ON "BookingRequest"("email");
