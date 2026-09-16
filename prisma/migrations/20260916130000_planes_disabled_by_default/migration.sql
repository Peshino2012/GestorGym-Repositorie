-- planesEnabled used to be dead data (module gating read an env var
-- instead) so its `true` default never mattered. Now that GymSettings is
-- the real source of truth, a new gym must start unpaid like Clases and
-- Horarios already do — existing rows keep whatever value they already
-- have, only the default for future rows changes.
ALTER TABLE "GymSettings" ALTER COLUMN "planesEnabled" SET DEFAULT false;
