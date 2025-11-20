/*
  Warnings:

  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
DROP COLUMN "id";
