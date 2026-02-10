"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react"; 
import { SplashScreen } from "@capacitor/splash-screen"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    const hideSplashScreen = async () => {
      try {
        // Wait 500ms so the website is definitely loaded behind the splash
        setTimeout(async () => {
          await SplashScreen.hide();
        }, 500);
      } catch (error) {
        // This catch prevents the app from crashing when testing in a web browser
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