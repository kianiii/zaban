import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  title: "پیگیری مطالعه Eteach",
  description: "برنامه دوماهه از ۱ آبان با نمودار پیشرفت و سطح A2",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Eteach",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#08110f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} ${vazir.className} antialiased`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
