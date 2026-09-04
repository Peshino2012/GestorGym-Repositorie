// Tells the public site (a separate deployment) to drop its cached copy
// of /api/public/site right away, instead of waiting out its 15s ISR
// window. Best-effort: if the site is down or misconfigured, the admin
// action that triggered this must still succeed — the site just falls
// back to its normal time-based revalidation.
export async function notifyPublicSite() {
  const base = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;

  try {
    await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // non-critical — swallow
  }
}
