-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT,
    "profilePhoto" TEXT,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" INTEGER NOT NULL,
    CONSTRAINT "Members_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plans" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "durationValue" INTEGER NOT NULL,
    "durationUnit" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "categoryId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "checkInTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" DATETIME,
    CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Members_email_key" ON "Members"("email");
