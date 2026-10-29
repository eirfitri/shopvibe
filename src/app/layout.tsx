import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopVibe — Fashion & Lifestyle Curated for the Contemporary Sun-Seeker",
  description:
    "Summer style should be easy to find, easy to love and easy to buy. Discover breathable linens, bold colors and architectural silhouettes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
