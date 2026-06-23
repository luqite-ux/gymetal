import type { MetadataRoute } from "next"

const SITE_URL = "https://www.gymetaltech.com"

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/api/"]

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
