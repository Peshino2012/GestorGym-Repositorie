-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canAccessClasses" BOOLEAN NOT NULL DEFAULT true,
    "canAccessHorarios" BOOLEAN NOT NULL DEFAULT true,
    "canAccessPlanes" BOOLEAN NOT NULL DEFAULT true,
    "canAccessCheckin" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("active", "canAccessClasses", "canAccessHorarios", "canAccessPlanes", "createdAt", "email", "id", "mustChangePassword", "name", "passwordHash", "phone", "role") SELECT "active", "canAccessClasses", "canAccessHorarios", "canAccessPlanes", "createdAt", "email", "id", "mustChangePassword", "name", "passwordHash", "phone", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
