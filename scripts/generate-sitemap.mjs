/**
 * Writes dist/sitemap.xml from the branch table, so branches created in the
 * dashboard appear in the sitemap on the next deploy without anyone editing a
 * file. Static routes come from src/content/seo-routes.json.
 *
 * Needs the public Supabase URL and publishable key (the same values that are
 * already inlined into the client bundle). They are read from the environment
 * first, then from .env.production or .env in the project root.
 *
 * If the database cannot be reached the build still succeeds: the sitemap that
 * `vite build` copied from public/ is left in place and a warning is printed.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const target = join(dist, "sitemap.xml");

const config = JSON.parse(readFileSync(join(root, "src/content/seo-routes.json"), "utf8"));

const readEnvFile = (name) => {
  const file = join(root, name);
  if (!existsSync(file)) return {};
  const values = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return values;
};

const fileEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.production") };
const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

const today = new Date().toISOString().slice(0, 10);

/** Static pages, with the branch index kept and branch detail pages left to the DB. */
const priorityFor = (path) => {
  if (path === "/") return "1.0";
  if (path === "/about" || path === "/branches") return "0.9";
  if (path === "/donate" || path === "/services" || path === "/live") return "0.8";
  return "0.7";
};

const entries = [];

for (const route of config.routes) {
  if (route.path.startsWith("/branches/") || route.path === "/branches") continue;
  entries.push({
    loc: `${config.siteUrl}${route.path}`,
    lastmod: today,
    changefreq: route.path === "/" ? "weekly" : "monthly",
    priority: priorityFor(route.path),
  });
}

// The branch directory itself.
entries.push({
  loc: `${config.siteUrl}/branches`,
  lastmod: today,
  changefreq: "weekly",
  priority: "0.9",
});

const fetchBranches = async () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not set");
  }
  const query =
    "/rest/v1/branches?select=id,name,slug,parent_id,is_state_branch,active,updated_at" +
    "&active=eq.true&order=name";
  const response = await fetch(`${supabaseUrl}${query}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(`branch query failed with HTTP ${response.status}`);
  }
  return response.json();
};

const asDate = (value) => (typeof value === "string" ? value.slice(0, 10) : today);

try {
  const branches = await fetchBranches();
  const slugById = new Map(branches.map((branch) => [branch.id, branch.slug]));

  for (const branch of branches) {
    // A chapter lives under its grouping branch: /branches/<grouping>/<chapter>.
    const parentSlug = branch.parent_id ? slugById.get(branch.parent_id) : undefined;
    const path = parentSlug
      ? `/branches/${parentSlug}/${branch.slug}`
      : `/branches/${branch.slug}`;
    entries.push({
      loc: `${config.siteUrl}${path}`,
      lastmod: asDate(branch.updated_at),
      changefreq: "weekly",
      priority: branch.is_state_branch ? "0.7" : "0.6",
    });
  }
  console.log(`generate-sitemap: ${branches.length} active branches from the database`);
} catch (error) {
  console.warn(
    `generate-sitemap: could not read branches (${error.message}); keeping the sitemap copied from public/`
  );
  process.exit(0);
}

const seen = new Set();
const unique = entries.filter((entry) => {
  if (seen.has(entry.loc)) return false;
  seen.add(entry.loc);
  return true;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(target, xml, "utf8");
console.log(`generate-sitemap: wrote ${unique.length} URLs`);
