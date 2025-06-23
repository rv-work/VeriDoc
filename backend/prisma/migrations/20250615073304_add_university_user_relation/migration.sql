-- AlterTable
ALTER TABLE "University" ADD COLUMN     "addedById" TEXT;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
