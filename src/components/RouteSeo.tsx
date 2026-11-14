import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import seoConfig from "@/content/seo-routes.json";

/** Canonical origin and name, shared with the build-time prerender step. */
const SITE_URL = seoConfig.siteUrl;
const SITE_NAME = seoConfig.siteName;

type RouteMeta = {
  title: string;
  description: string;
  noIndex?: boolean;
};

/**
 * Public routes, from the same table scripts/prerender-meta.mjs turns into
 * static HTML, so the shell and the prerendered files always agree.
 */
const PUBLIC_ROUTES: Record<string, RouteMeta> = Object.fromEntries(
  seoConfig.routes.map((route) => [
    route.path,
    { title: route.title, description: route.description },
  ])
);

/** Screens that are reachable but should never appear in a search result. */
const PRIVATE_ROUTES: Record<string, RouteMeta> = {
  "/admin": { title: "Admin — BEHT JAMAA", description: "BEHT JAMAA administration.", noIndex: true },
  "/auth": { title: "Sign In — BEHT JAMAA", description: "Sign in to BEHT JAMAA.", noIndex: true },
  "/reset-password": {
    title: "Reset Password — BEHT JAMAA",
    description: "Set a new password for your BEHT JAMAA account.",
    noIndex: true,
  },
  "/members": {
    title: "Become a Member — BEHT JAMAA",
    description: "Join BEHT JAMAA as a member and take part in the ministry.",
    noIndex: true,
  },
};

// Slugs like "beht-usa" should read as "BEHT USA", not "Beht Usa".
const ACRONYMS = new Set(["beht", "usa", "uk", "us", "nyc", "dc", "ca"]);

const titleCase = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

const metaFor = (pathname: string): RouteMeta => {
  const known = PUBLIC_ROUTES[pathname] ?? PRIVATE_ROUTES[pathname];
  if (known) return known;

  // Branch pages added after the last deploy still get a sensible title.
  if (pathname.startsWith("/branches/")) {
    const segments = pathname.split("/").filter(Boolean);
    const isEvent = segments.includes("events");
    const slug = segments[segments.length - 1] ?? "";
    const name = titleCase(slug);
    return {
      title: `${name}${isEvent ? " Event" : " Branch"} — ${SITE_NAME}`,
      description: isEvent
        ? `Details and tickets for ${name}, a ${SITE_NAME} branch event.`
        : `${name} is a ${SITE_NAME} branch. Find service times, leadership, events and ways to join.`,
    };
  }

  return {
    title: `Page Not Found — ${SITE_NAME}`,
    description: "The page you were looking for is not here.",
    noIndex: true,
  };
};

const setMeta = (attribute: "name" | "property", key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

/**
 * Keeps the document title, description, canonical URL and social tags in step
 * with the current route. Public routes already arrive with their tags in the
 * HTML thanks to the prerender step; this covers client-side navigation.
 */
export const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaFor(pathname);
    const url = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;

    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.noIndex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setCanonical(url);
  }, [pathname]);

  return null;
};

export default RouteSeo;
