import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "AuraHR — AI Employee Feedback Agent",
  description: "AI-powered Employee Feedback Management System with sentiment analysis and HR insights",
  keywords: ["HR", "feedback", "AI", "employee management", "sentiment analysis"],
  authors: [{ name: "AuraHR Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="aurora-bg min-h-screen antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
