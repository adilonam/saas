-- CreateTable
CREATE TABLE "IqTestAttempt" (
    "id" TEXT NOT NULL,
    "guestToken" TEXT,
    "userId" TEXT,
    "answers" JSONB NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IqTestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IqTestAttempt_guestToken_idx" ON "IqTestAttempt"("guestToken");

-- CreateIndex
CREATE INDEX "IqTestAttempt_userId_idx" ON "IqTestAttempt"("userId");

-- CreateIndex
CREATE INDEX "IqTestAttempt_guestToken_updatedAt_idx" ON "IqTestAttempt"("guestToken", "updatedAt");

-- CreateIndex
CREATE INDEX "IqTestAttempt_userId_updatedAt_idx" ON "IqTestAttempt"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "IqTestAttempt" ADD CONSTRAINT "IqTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
