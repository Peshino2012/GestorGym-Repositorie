import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { getGymSettings } from "@/lib/gymSettings";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const gym = await getGymSettings();
  return {
    title: `Gestor ${gym.name} — Panel de administración`,
    description: "Panel de gestión para gimnasios: cobros, socios, clases y retención.",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const gym = await getGymSettings();

  return (
    <html lang="es" className={`${sora.variable} h-full antialiased`}>
      {gym.themeColor && (
        <head>
          {/* Overrides the default Cauccen blue/teal with this gym's own
              brand color, sampled from their logo at onboarding — makes
              the panel read as their own product, not "powered by
              Cauccen". */}
          <style>{`:root { --primary: ${gym.themeColor}; }`}</style>
        </head>
      )}
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
