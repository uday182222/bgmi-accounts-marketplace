import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "GameSwap - Secure Gaming Account Marketplace",
  description: "The most trusted marketplace for buying and selling gaming accounts with secure escrow protection.",
  keywords: "gaming accounts, fortnite, league of legends, valorant, roblox, secure marketplace",
  authors: [{ name: "GameSwap Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff3333",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
