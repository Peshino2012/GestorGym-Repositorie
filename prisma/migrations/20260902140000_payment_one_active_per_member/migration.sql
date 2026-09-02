-- Hand-written (not represented in schema.prisma — Prisma has no cross-db
-- syntax for partial/filtered unique indexes). Makes it impossible, at the
-- database level, for a member to ever have more than one active (PENDING
-- or OVERDUE) payment at the same time, regardless of any application-level
-- bug, stale client, or race between concurrent requests.
CREATE UNIQUE INDEX "Payment_one_active_per_member" ON "Payment"("memberId") WHERE "status" IN ('PENDING', 'OVERDUE');
