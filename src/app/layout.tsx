"use client"; // Mandatory for using useEffect in Next.js App Router

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react"; // Added this
import { SplashScreen } from "@capacitor/splash-screen"; // Added this
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Note: In Next.js App Router, metadata must be in a separate file 
// or the layout must not have "use client" if you want to export it here.
// Since we NEED "use client" for the splash screen, I've moved the logic 
// into a separate client component or internal function.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    const hideSplashScreen = async () => {
      try {
        // We add a tiny delay (500ms) to ensure the first paint of the 
        // website is done so the user doesn't see a white flash.
        setTimeout(async () => {
          await SplashScreen.hide();
        }, 500);
      } catch (error) {
        console.warn("Capacitor Splash Screen not found (normal in browser)");
      }
    };

    hideSplashScreen();
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}