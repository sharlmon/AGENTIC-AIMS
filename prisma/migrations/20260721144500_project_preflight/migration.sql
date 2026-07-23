-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'archived');

-- AlterTable
ALTER TABLE "Project"
  ADD COLUMN "name" TEXT NOT NULL,
  ADD COLUMN "roomName" TEXT NOT NULL,
  ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "Project_roomName_key" ON "Project"("roomName");
