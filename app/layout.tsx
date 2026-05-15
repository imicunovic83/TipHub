import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TipHub — Expert World Cup 2026 predictions",
  description:
    "Daily betting tips from professional tipsters with bookmaker odds comparison across 5 Serbian bookmakers, for every group-stage match of the FIFA World Cup 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="layout">
        <Header />
        <main className="layout-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
