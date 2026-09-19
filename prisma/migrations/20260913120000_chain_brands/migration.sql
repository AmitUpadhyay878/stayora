-- The chain rebuild replaces the world-catalog seed. Clear dependent rows first
-- (spec: re-seed replaces Paris / Tokyo / New York catalog).
DELETE FROM "BookingRequest";
DELETE FROM "WishlistItem";
DELETE FROM "Review";
DELETE FROM "Hotel";
DELETE FROM "City";

-- CreateEnum
CREATE TYPE "BrandTier" AS ENUM ('value', 'mid', 'premium', 'leisure');

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "baths",
DROP COLUMN "bedrooms",
DROP COLUMN "beds",
DROP COLUMN "type",
ADD COLUMN     "brandId" TEXT NOT NULL,
ADD COLUMN     "contactBlurb" TEXT NOT NULL,
ADD COLUMN     "diningBlurb" TEXT NOT NULL,
ADD COLUMN     "diningName" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PropertyType";

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" "BrandTier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomCategory" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sizeSqFt" INTEGER NOT NULL,
    "sleeps" INTEGER NOT NULL,
    "bedType" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoomCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearbyAttraction" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NearbyAttraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "RoomCategory_hotelId_idx" ON "RoomCategory"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomCategory_hotelId_slug_key" ON "RoomCategory"("hotelId", "slug");

-- CreateIndex
CREATE INDEX "GalleryImage_hotelId_idx" ON "GalleryImage"("hotelId");

-- CreateIndex
CREATE INDEX "NearbyAttraction_hotelId_idx" ON "NearbyAttraction"("hotelId");

-- CreateIndex
CREATE INDEX "Hotel_brandId_idx" ON "Hotel"("brandId");

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomCategory" ADD CONSTRAINT "RoomCategory_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyAttraction" ADD CONSTRAINT "NearbyAttraction_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
