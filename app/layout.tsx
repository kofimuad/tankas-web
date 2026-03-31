import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Tankas — Snap. Clean. Earn.",
  description:
    "Ghana's environmental cleanup coordination platform. Report issues, volunteer for cleanups, and earn rewards.",
  keywords: ["ghana", "environment", "cleanup", "volunteer", "tankas"],
  openGraph: {
    title: "Tankas — Snap. Clean. Earn.",
    description: "Ghana's environmental cleanup coordination platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
