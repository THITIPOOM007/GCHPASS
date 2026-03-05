import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
    title: "ระบบตรวจประเมิน GCHP 2569 | สสจ.ศรีสะเกษ",
    description: "ระบบตรวจประเมินออนไลน์ตามมาตรฐาน GCHP ปีงบประมาณ 2569 สำนักงานสาธารณสุขจังหวัดศรีสะเกษ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="font-sarabun bg-slate-50 text-slate-800 antialiased">
                {children}
            </body>
        </html>
    );
}
