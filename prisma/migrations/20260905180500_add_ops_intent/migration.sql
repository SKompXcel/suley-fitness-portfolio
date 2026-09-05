-- CreateTable
CREATE TABLE "OpsIntent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "resultUrl" TEXT,
    "resultNote" TEXT,
    "error" TEXT,

    CONSTRAINT "OpsIntent_pkey" PRIMARY KEY ("id")
);

