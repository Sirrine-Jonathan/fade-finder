import type { Metadata, Viewport } from "next";
import StyledComponentsRegistry from "./registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fade Finder — Local Barbers. On Demand.",
  description: "Find local barbers in your area who will travel to your location (mobile house calls) or host you in their studio. Compare by distance, DOPL license verification, ratings, and dual pricing.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fade Finder",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1318",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <AuthProvider>{children}</AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

