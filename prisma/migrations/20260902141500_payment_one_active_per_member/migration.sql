-- Hand-written (not represented in schema.prisma — Prisma has no cross-db
-- syntax for partial/filtered unique indexes). Makes it impossible, at the
-- database level, for a member to ever have more than one active (PENDING
-- or OVERDUE) payment at the same time, regardless of any application-level
-- bug, stale client, or race between concurrent requests.

-- Clean up any pre-existing duplicate active payments before the constraint
-- goes on. This system is pre-launch — any duplicates here are test data
-- from before this fix existed, not real financial records. Keeps the most
-- recently created active payment per member, deletes the older one(s).
DELETE FROM "Payment"
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id",
      ROW_NUMBER() OVER (PARTITION BY "memberId" ORDER BY "createdAt" DESC) AS rn
    FROM "Payment"
    WHERE "status" IN ('PENDING', 'OVERDUE')
  ) ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX "Payment_one_active_per_member" ON "Payment"("memberId") WHERE "status" IN ('PENDING', 'OVERDUE');
