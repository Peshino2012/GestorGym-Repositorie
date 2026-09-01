-- AlterTable
ALTER TABLE "GymClass" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'dumbbell',
ADD COLUMN     "showOnSite" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ClassCard";
