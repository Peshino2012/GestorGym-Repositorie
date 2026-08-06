-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY'
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "planId" TEXT NOT NULL,
    CONSTRAINT "Member_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "CheckIn_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GymClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "GymClass" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "MessageLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_classId_memberId_key" ON "Booking"("classId", "memberId");
