-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Plan" ("billingCycle", "id", "name", "price") SELECT "billingCycle", "id", "name", "price" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
