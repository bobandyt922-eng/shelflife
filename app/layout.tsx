import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShelfLife — The Collector's Edition Tracker",
  description: "Catalog your library. Know your book's worth. Never miss a drop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
