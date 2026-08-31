import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Store Lab MVP",
  description: "Imagine a brand. Make the products. Build the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
