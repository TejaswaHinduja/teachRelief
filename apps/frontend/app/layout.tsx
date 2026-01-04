import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teachrelief.tejaswahinduja.me"),
  title: "TeachRelief",
  description: "Helping teachers save their time by automating the grading process",

  openGraph: {
    title: "TeachRelief",
    description: "Helping teachers save their time by automating the grading process",
    url: "https://teachrelief.tejaswahinduja.me",
    siteName: "TeachRelief",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "TeachRelief – AI-powered grading assistant",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TeachRelief",
    description: "Helping teachers save their time by automating the grading process",
    images: ["/og.png"],  
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
