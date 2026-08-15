import { getSeoMeta, SITE_NAME } from "@shared/seo-content";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function SeoRouteHead() {
  const [location] = useLocation();
  useEffect(() => {
    const meta = getSeoMeta(location);
    document.title = meta.title || SITE_NAME;
    const description = document.querySelector('meta[name="description"]') || document.head.appendChild(document.createElement("meta"));
    description.setAttribute("name", "description");
    description.setAttribute("content", meta.description);
  }, [location]);
  return null;
}
