import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GPA Calculator - Tính Điểm GPA Online",
    short_name: "GPA Calculator",
    description:
      "Công cụ tính điểm GPA trực tuyến miễn phí cho sinh viên Việt Nam",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    lang: "vi",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
