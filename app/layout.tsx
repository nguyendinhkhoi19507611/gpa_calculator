import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gpa.example.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tính Điểm GPA Online | Thang 4 & Thang 10 - Chính Xác 100%",
    template: "%s | GPA Calculator",
  },
  description:
    "Công cụ tính điểm GPA trực tuyến miễn phí cho sinh viên Việt Nam. Hỗ trợ thang điểm 4 & thang điểm 10, tính từ cột điểm thành phần, xem chi tiết công thức. Chính xác, nhanh chóng.",
  keywords: [
    "tính điểm GPA",
    "GPA calculator",
    "tính điểm trung bình",
    "tính GPA online",
    "thang điểm 4",
    "thang điểm 10",
    "điểm tích lũy",
    "sinh viên",
    "đại học",
    "tính điểm đại học",
    "GPA sinh viên",
    "tính điểm trung bình tích lũy",
  ],
  authors: [{ name: "GPA Calculator" }],
  creator: "GPA Calculator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "GPA Calculator",
    title: "Tính Điểm GPA Online | Thang 4 & Thang 10 - Chính Xác 100%",
    description:
      "Công cụ tính điểm GPA miễn phí cho sinh viên Việt Nam. Hỗ trợ thang 4 & thang 10, công thức chi tiết, quản lý theo năm học & học kỳ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tính Điểm GPA Online | Miễn Phí & Chính Xác",
    description:
      "Tính GPA theo thang 4 & thang 10 cho sinh viên Việt Nam. Nhập điểm, xem công thức chi tiết.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD Structured Data for Google Rich Results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GPA Calculator - Tính Điểm GPA Online",
  description:
    "Công cụ tính điểm GPA trực tuyến miễn phí cho sinh viên Việt Nam. Hỗ trợ thang điểm 4 và thang điểm 10.",
  url: SITE_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "VND",
  },
  inLanguage: "vi",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
