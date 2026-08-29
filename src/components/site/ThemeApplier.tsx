import { useEffect } from "react";
import { useSettings } from "@/lib/data";

/** এডমিন সেটিংস থেকে থিম কালার ও ফন্ট লাইভ প্রয়োগ করে */
export function ThemeApplier() {
  const { data } = useSettings();

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    if (data.primary_color) {
      root.style.setProperty("--primary", data.primary_color);
      root.style.setProperty("--ring", data.primary_color);
    }
    if (data.secondary_color) {
      root.style.setProperty("--accent", data.secondary_color);
    }
    if (data.font_family) {
      root.style.setProperty("--font-body", `"${data.font_family}", system-ui, sans-serif`);
      root.style.setProperty("--font-heading", `"${data.font_family}", system-ui, sans-serif`);
    }
    if (data.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = data.favicon_url;
    }
  }, [data]);

  return null;
}
