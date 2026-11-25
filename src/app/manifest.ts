import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Học Guitar — lộ trình cho người mới",
    short_name: "Học Guitar",
    description:
      "Lộ trình học guitar từ con số 0, kèm máy lên dây, máy đếm nhịp và thư viện hợp âm.",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#8a4b2a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
