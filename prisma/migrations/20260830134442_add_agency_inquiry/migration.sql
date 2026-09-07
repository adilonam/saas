-- CreateEnum
CREATE TYPE "AgencyInquiryStatus" AS ENUM ('PENDING', 'REVIEWED', 'CLOSED');

-- CreateTable
CREATE TABLE "AgencyInquiry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "status" "AgencyInquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgencyInquiry_userId_idx" ON "AgencyInquiry"("userId");

-- AddForeignKey
ALTER TABLE "AgencyInquiry" ADD CONSTRAINT "AgencyInquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
