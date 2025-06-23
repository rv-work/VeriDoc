/*
  Warnings:

  - Made the column `addedById` on table `University` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "University" DROP CONSTRAINT "University_addedById_fkey";

-- AlterTable
ALTER TABLE "University" ALTER COLUMN "addedById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
