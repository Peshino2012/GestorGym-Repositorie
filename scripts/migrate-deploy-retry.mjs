// Every deploy runs `prisma migrate deploy`, which briefly holds a Postgres
// advisory lock — including a deploy that changes nothing but an env var
// (see gestor-admin-panel's module toggle: it redeploys the current
// commit as-is). Two deploys landing close together (a toggle fired right
// after another, or a toggle racing a git push) can collide on that lock;
// `migrate deploy` gives up after a fixed 10s wait (P1002) instead of
// retrying, which fails the whole build and leaves the OLD deployment —
// and its stale env var value — live. Retrying here absorbs that
// transient contention instead of failing the build over it.
import { spawnSync } from "node:child_process";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      shell: true,
    });

    if (result.status === 0) return;

    const isLastAttempt = attempt === MAX_ATTEMPTS;
    if (isLastAttempt) process.exit(result.status ?? 1);

    console.log(
      `\nmigrate deploy failed (attempt ${attempt}/${MAX_ATTEMPTS}) — retrying in ${RETRY_DELAY_MS / 1000}s in case another deploy is holding the migration lock...\n`
    );
    await sleep(RETRY_DELAY_MS);
  }
}

main();
