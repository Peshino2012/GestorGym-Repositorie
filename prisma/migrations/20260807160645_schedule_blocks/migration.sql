-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "hoursLabel" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'sun',
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "blockId" TEXT NOT NULL,
    CONSTRAINT "ScheduleEntry_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ScheduleBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
