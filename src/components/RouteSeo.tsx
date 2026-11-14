import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Canonical origin for every indexable URL. */
const SITE_URL = "https://behtjamaa.vercel.app";
const SITE_NAME = "BEHT JAMAA";

type RouteMeta = {
  title: string;
  description: string;
  noIndex?: boolean;
};

const STATIC_ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "BEHT JAMAA — Youth Evangelistic Ministry | Reach and Preach",
    description:
      "BEHT JAMAA (Boyz Evangelists of the Holy Trinity) is a youth evangelistic ministry founded in 2011, winning souls for Christ through the arts, discipleship and community across the USA and Africa.",
  },
  "/about": {
    title: "About BEHT JAMAA — Founders, Story and Mission",
    description:
      "Meet the founders of BEHT JAMAA, learn how the ministry began in 2011 and what it stands for today.",
  },
  "/live": {
    title: "Live Broadcast — BEHT JAMAA",
    description: "Watch BEHT JAMAA live broadcasts, worship and ministry sessions.",
  },
  "/prayer": {
    title: "Prayer Requests — BEHT JAMAA",
    description: "Submit a prayer request and pray for others in the BEHT JAMAA community.",
  },
  "/services": {
    title: "Ministry Services — BEHT JAMAA",
    description:
      "The ministries of BEHT JAMAA: worship, discipleship, outreach and the creative arts.",
  },
  "/contact": {
    title: "Contact BEHT JAMAA",
    description: "Get in touch with BEHT JAMAA by email or phone, or find your nearest branch.",
  },
  "/donate": {
    title: "Support the Mission — BEHT JAMAA",
    description:
      "Support BEHT JAMAA with a gift that funds ministry content, community outreach and discipleship.",
  },
  "/members": {
    title: "Become a Member — BEHT JAMAA",
    description: "Join BEHT JAMAA as a member and take part in the ministry.",
  },
  "/branches": {
    title: "Branches Worldwide — BEHT JAMAA",
    description:
      "Find a BEHT JAMAA branch near you and join a community transforming lives for Jesus Christ.",
  },
  "/admin": {
    title: "Admin — BEHT JAMAA",
    description: "BEHT JAMAA administration.",
    noIndex: true,
  },
  "/auth": {
    title: "Sign In — BEHT JAMAA",
    description: "Sign in to BEHT JAMAA.",
    noIndex: true,
  },
  "/reset-password": {
    title: "Reset Password — BEHT JAMAA",
    description: "Set a new password for your BEHT JAMAA account.",
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
  const exact = STATIC_ROUTES[pathname];
  if (exact) return exact;

  // Branch portals and branch events: derive a readable name from the slug.
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
 * with the current route. The SPA cannot serve per-page HTML without a render
 * step, so this covers browsers, tabs, bookmarks and crawlers that execute JS.
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
