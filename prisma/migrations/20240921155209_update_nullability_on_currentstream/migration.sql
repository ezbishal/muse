-- DropForeignKey
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_streamId_fkey";

-- AlterTable
ALTER TABLE "CurrentStream" ALTER COLUMN "streamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
