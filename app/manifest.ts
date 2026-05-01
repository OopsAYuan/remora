import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Remora · 阅读学词",
    short_name: "Remora",
    description: "阅读英文文章，点击查词，划选翻译",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111318",
    theme_color: "#111318",
    icons: [
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
