import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { getGymSettings } from "@/lib/gymSettings";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// A single static icon.png here would be the same Cauccen "C" for every
// client deployment — this makes the browser tab show each gym's own logo
// instead, falling back to that same Cauccen mark (now served from
// public/brand/icon.png, same asset Sidebar's own fallback uses) for a gym
// that hasn't uploaded one yet. ImageResponse needs an absolute URL for a
// remote <img>, so the fallback is built from the request's own host —
// same pattern cobros/actions.ts uses for the Mercado Pago webhook URL.
export default async function Icon() {
  const gym = await getGymSettings();
  const host = (await headers()).get("host") ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const logoSrc = gym.logoUrl ?? `${protocol}://${host}/brand/icon.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 12,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders its own JSX tree server-side, not the DOM */}
        <img src={logoSrc} width={56} height={56} style={{ objectFit: "contain" }} alt="" />
      </div>
    ),
    size
  );
}
