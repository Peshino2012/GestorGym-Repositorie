-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GymSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "name" TEXT NOT NULL DEFAULT 'PULSO Gym',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "checkinEnabled" BOOLEAN NOT NULL DEFAULT false,
    "classesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "horariosEnabled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_GymSettings" ("address", "checkinEnabled", "classesEnabled", "email", "id", "logoUrl", "name", "phone") SELECT "address", "checkinEnabled", "classesEnabled", "email", "id", "logoUrl", "name", "phone" FROM "GymSettings";
DROP TABLE "GymSettings";
ALTER TABLE "new_GymSettings" RENAME TO "GymSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
