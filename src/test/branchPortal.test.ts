import { describe, it, expect } from "vitest";

// Extract the pure slug generation logic used in AdminPage handleSaveBranch
const generateSlug = (name: string, customSlug?: string): string => {
  if (customSlug) return customSlug;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// Replicate the BRANCH_TABLES constant from BranchPortalPage
const BRANCH_TABLES = {
  branch_members: "branch_members" as const,
  branch_events: "branch_events" as const,
  branch_services: "branch_services" as const,
  branch_episodes: "branch_episodes" as const,
  branch_donations: "branch_donations" as const,
  branch_prayers: "branch_prayers" as const,
  store_items: "store_items" as const,
};
type BranchTable = keyof typeof BRANCH_TABLES;

describe("Branch slug generation", () => {
  it("generates a slug from a simple name", () => {
    expect(generateSlug("New York")).toBe("new-york");
  });

  it("generates a slug from a multi-word name", () => {
    expect(generateSlug("Los Angeles Branch")).toBe("los-angeles-branch");
  });

  it("uses custom slug when provided", () => {
    expect(generateSlug("Any Name", "my-custom-slug")).toBe("my-custom-slug");
  });

  it("handles empty name", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens", () => {
    expect(generateSlug("  Hello World  ")).toBe("hello-world");
  });

  it("collapses multiple special characters into one hyphen", () => {
    expect(generateSlug("Hello!!!World???")).toBe("hello-world");
  });

  it("handles names with numbers", () => {
    expect(generateSlug("Branch 42")).toBe("branch-42");
  });

  it("lowercases the name", () => {
    expect(generateSlug("KAMPALA BRANCH")).toBe("kampala-branch");
  });

  it("handles single word names", () => {
    expect(generateSlug("Kampala")).toBe("kampala");
  });

  it("preserves custom slug with special characters", () => {
    expect(generateSlug("Name", "my_slug-2.0")).toBe("my_slug-2.0");
  });
});

describe("Branch table constants", () => {
  it("contains all expected branch-scoped tables", () => {
    const expected: BranchTable[] = [
      "branch_members",
      "branch_events",
      "branch_services",
      "branch_episodes",
      "branch_donations",
      "branch_prayers",
      "store_items",
    ];
    for (const key of expected) {
      expect(BRANCH_TABLES[key]).toBe(key);
    }
  });

  it("maps each key to itself as the table name", () => {
    for (const [key, value] of Object.entries(BRANCH_TABLES)) {
      expect(key).toBe(value);
    }
  });

  it("has exactly 7 tables", () => {
    expect(Object.keys(BRANCH_TABLES)).toHaveLength(7);
  });
});

describe("Branch name validation", () => {
  const isValidBranchName = (name: string): boolean => name.trim().length > 0;

  it("rejects empty name", () => {
    expect(isValidBranchName("")).toBe(false);
  });

  it("rejects whitespace-only name", () => {
    expect(isValidBranchName("   ")).toBe(false);
  });

  it("accepts a valid name", () => {
    expect(isValidBranchName("New York Branch")).toBe(true);
  });

  it("accepts name with leading/trailing spaces", () => {
    expect(isValidBranchName("  Kampala  ")).toBe(true);
  });
});
