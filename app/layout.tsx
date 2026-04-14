import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ShelfLife — The Collector's Edition Tracker",
  description: "Catalog your library. Know your book's worth. Never miss a drop.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ShelfLife",
  },
};

export const viewport: Viewport = {
  themeColor: "#c4a265",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
