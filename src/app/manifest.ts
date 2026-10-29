import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Döngüden Özgürlüğe",
    short_name: "Döngüden Özgürlüğe",
    description:
      "Kişiye özel günlük pratik, nefes çalışmaları ve eğitmen rehberliği sunan farkındalık üyeliği.",
    start_url: "/profilim",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "tr",
    background_color: "#eef1ec",
    theme_color: "#3f6f5e",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
