-- AlterTable
ALTER TABLE "RoomCategory" ADD COLUMN     "view" TEXT,
ADD COLUMN     "priceFrom" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extras" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "roomPreference" TEXT,
ADD COLUMN     "extras" TEXT[] DEFAULT ARRAY[]::TEXT[];
