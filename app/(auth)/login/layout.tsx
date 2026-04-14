import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập",
  description:
    "Đăng nhập vào hệ thống tính điểm GPA online. Quản lý điểm số, GPA theo năm học và học kỳ.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
