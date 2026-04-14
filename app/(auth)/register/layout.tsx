import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký Tài Khoản",
  description:
    "Tạo tài khoản miễn phí để sử dụng công cụ tính điểm GPA online. Quản lý điểm số theo năm học, học kỳ.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
