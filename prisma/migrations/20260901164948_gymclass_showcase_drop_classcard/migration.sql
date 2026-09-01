/*
  Warnings:

  - You are about to drop the `ClassCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassCard";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GymClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'dumbbell',
    "showOnSite" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_GymClass" ("capacity", "dayOfWeek", "durationMin", "id", "instructor", "name", "startTime") SELECT "capacity", "dayOfWeek", "durationMin", "id", "instructor", "name", "startTime" FROM "GymClass";
DROP TABLE "GymClass";
ALTER TABLE "new_GymClass" RENAME TO "GymClass";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
