import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tính Điểm GPA",
  description: "Tính điểm trung bình tích lũy theo thang điểm 4 và thang điểm 10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
