import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroSync",
  description: "Interní rezervační systém pro aerokluby"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
