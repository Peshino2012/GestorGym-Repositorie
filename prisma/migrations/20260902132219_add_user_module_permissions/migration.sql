-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canAccessClasses" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canAccessHorarios" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canAccessPlanes" BOOLEAN NOT NULL DEFAULT true;
