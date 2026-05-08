-- CreateEnum
CREATE TYPE "WorkspaceAppMode" AS ENUM ('production', 'marketing', 'automation');

-- CreateEnum
CREATE TYPE "WorkspaceAppSource" AS ENUM ('vercel', 'external');

-- CreateEnum
CREATE TYPE "WorkspaceAppStatus" AS ENUM ('active', 'draft', 'disabled');

-- CreateTable
CREATE TABLE "WorkspaceApp" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "WorkspaceAppMode" NOT NULL,
    "source" "WorkspaceAppSource" NOT NULL DEFAULT 'vercel',
    "url" TEXT NOT NULL,
    "vercelProjectId" TEXT,
    "vercelDeploymentUrl" TEXT,
    "healthPath" TEXT,
    "description" TEXT,
    "status" "WorkspaceAppStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceApp_workspaceId_mode_name_key" ON "WorkspaceApp"("workspaceId", "mode", "name");

-- CreateIndex
CREATE INDEX "WorkspaceApp_workspaceId_idx" ON "WorkspaceApp"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceApp_workspaceId_mode_idx" ON "WorkspaceApp"("workspaceId", "mode");

-- CreateIndex
CREATE INDEX "WorkspaceApp_status_idx" ON "WorkspaceApp"("status");
