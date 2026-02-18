import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const thuPhap = localFont({
  src: "../../public/fonts/thuphap.ttf",
  variable: "--font-thuphap-local",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xin Chữ Đầu Năm | Bính Ngọ",
  description:
    "Xin chữ ông đồ đầu năm mới - Tết Bính Ngọ. Nhận chữ thư pháp và lời chúc riêng dành cho bạn.",
  keywords: ["xin chữ", "tết", "thư pháp", "ông đồ", "bính ngọ", "năm mới"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${beVietnam.variable} ${thuPhap.variable} antialiased`}
        style={{ fontFamily: "var(--font-be-vietnam), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
