/*
  Warnings:

  - You are about to drop the column `adresseeId` on the `Friendship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requesterId,addresseeId]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addresseeId` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_adresseeId_fkey";

-- DropIndex
DROP INDEX "Friendship_requesterId_adresseeId_key";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "adresseeId",
ADD COLUMN     "addresseeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
