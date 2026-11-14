/**
 * Emits one HTML file per public route after `vite build`, each carrying that
 * route's title, description, canonical URL and social tags in the markup
 * itself. Link-preview bots and crawlers that do not execute JavaScript read
 * these files instead of the shared SPA shell.
 *
 * The route table lives in src/content/seo-routes.json so the in-app metadata
 * (src/components/RouteSeo.tsx) and these files can never disagree.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const config = JSON.parse(readFileSync(join(root, "src/content/seo-routes.json"), "utf8"));
const template = readFileSync(join(dist, "index.html"), "utf8");

const escapeAttribute = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const setMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`(<meta ${attribute}="${key}" content=")[^"]*(")`);
  if (!pattern.test(html)) {
    throw new Error(`index.html has no <meta ${attribute}="${key}"> to replace`);
  }
  return html.replace(pattern, `$1${escapeAttribute(content)}$2`);
};

const canonicalFor = (path) => `${config.siteUrl}${path === "/" ? "/" : path}`;

const renderRoute = (route) => {
  const title = route.title;
  const description = route.description;
  const url = canonicalFor(route.path);

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeAttribute(url)}$2`);

  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "robots", "index, follow");
  return html;
};

const written = [];
for (const route of config.routes) {
  const html = renderRoute(route);
  const target = route.path === "/" ? join(dist, "index.html") : join(dist, route.path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, "utf8");
  written.push(route.path);
}

console.log(`prerender-meta: wrote ${written.length} route files (${written.join(", ")})`);
