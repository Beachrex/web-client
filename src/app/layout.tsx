import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "BeachRex - Find your perfect beach.",
  description: "All the beaches of the world in one place. For every tourist to find his or hers perfect beach for their earned vacation. This is the vision of BeachRex that I dedicated 4 years of my life to. During this time that I've travelled, I've created world's largest database of photos, videos, panoramas, sperichal photos and data on beaches of Spain, France, Slovenia, Croatia and Italy. Currently, I am creating a final website and mobile application with a complete presentation of all 2.445 beaches, 56.000 photos, videos, panoramas, spherical photos and 200 detailed data e.g. charasteristics of every beach. BeachRex's vision is that within few years we will obtain photos and other data for all the beaches of the world. If you love beaches and you like BeachRex's idea please support us and share our site with your friends.",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
