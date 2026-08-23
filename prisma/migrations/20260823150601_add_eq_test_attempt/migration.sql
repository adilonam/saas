-- CreateTable
CREATE TABLE "EqTestAttempt" (
    "id" TEXT NOT NULL,
    "guestToken" TEXT,
    "userId" TEXT,
    "answers" JSONB NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EqTestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EqTestAttempt_guestToken_idx" ON "EqTestAttempt"("guestToken");

-- CreateIndex
CREATE INDEX "EqTestAttempt_userId_idx" ON "EqTestAttempt"("userId");

-- CreateIndex
CREATE INDEX "EqTestAttempt_guestToken_updatedAt_idx" ON "EqTestAttempt"("guestToken", "updatedAt");

-- CreateIndex
CREATE INDEX "EqTestAttempt_userId_updatedAt_idx" ON "EqTestAttempt"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "EqTestAttempt" ADD CONSTRAINT "EqTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
