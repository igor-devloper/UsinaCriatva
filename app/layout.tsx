import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Usinas Criativa",
  description: "Gerencia as usinas da criativa energia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable}  antialiased`}
      >
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >

          {children}
          <Toaster/>

        </ClerkProvider>
      </body>
    </html>
  );
}
