-- CreateTable
CREATE TABLE "DnaTestAttempt" (
    "id" TEXT NOT NULL,
    "guestToken" TEXT,
    "userId" TEXT,
    "result" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DnaTestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DnaTestAttempt_guestToken_idx" ON "DnaTestAttempt"("guestToken");

-- CreateIndex
CREATE INDEX "DnaTestAttempt_userId_idx" ON "DnaTestAttempt"("userId");

-- CreateIndex
CREATE INDEX "DnaTestAttempt_guestToken_updatedAt_idx" ON "DnaTestAttempt"("guestToken", "updatedAt");

-- CreateIndex
CREATE INDEX "DnaTestAttempt_userId_updatedAt_idx" ON "DnaTestAttempt"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "DnaTestAttempt" ADD CONSTRAINT "DnaTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
