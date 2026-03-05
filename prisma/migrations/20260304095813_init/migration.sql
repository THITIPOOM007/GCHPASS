-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "district" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "assessorName1" TEXT NOT NULL,
    "assessorName2" TEXT,
    "agencyHead" TEXT NOT NULL,
    "agencyHeadPosition" TEXT NOT NULL,
    "totalScore" REAL NOT NULL,
    "kpiA" REAL NOT NULL,
    "kpiB" REAL NOT NULL,
    "kpiPercentage" REAL NOT NULL,
    "kpiLevel" INTEGER NOT NULL,
    "scores" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "sla10" BOOLEAN NOT NULL DEFAULT false,
    "sla30" BOOLEAN NOT NULL DEFAULT false,
    "sla60" BOOLEAN NOT NULL DEFAULT false,
    "verifyDoc" BOOLEAN NOT NULL DEFAULT false,
    "verifySystem" BOOLEAN NOT NULL DEFAULT false,
    "verifyRandom" BOOLEAN NOT NULL DEFAULT false,
    "randomCount" TEXT,
    "comments" TEXT,
    "signAssessor" TEXT,
    "signAssessee" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_district_key" ON "Assessment"("district");
