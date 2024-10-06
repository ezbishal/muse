/*
  Warnings:

  - Made the column `streamId` on table `CurrentStream` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `playedTimestamp` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_streamId_fkey";

-- AlterTable
ALTER TABLE "CurrentStream" ALTER COLUMN "streamId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "played" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playedTimestamp" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
