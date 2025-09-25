"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUser(user));
    return unsubscribe;
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <nav className="bg-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Campus Event Notifier
            </Link>
            <div>
              {!user && (
                <Link href="./auth/login" className="mr-4">
                  Login
                </Link>
              )}
              {user && <span className="mr-4">Welcome, {user.email}</span>}
              {user && <Button onClick={() => auth.signOut()}>Logout</Button>}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
