-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'basic', 'premium', 'enterprise');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "subscription" "Plan" NOT NULL DEFAULT 'free';
