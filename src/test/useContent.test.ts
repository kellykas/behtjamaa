import { describe, it, expect } from "vitest";

// Replicate the map-building logic used in useSiteSettings and AdminPage
type SiteSetting = { key: string; value: string | null; section: string };

const buildSettingsMap = (data: SiteSetting[]): Record<string, string> => {
  const map: Record<string, string> = {};
  data.forEach((s) => {
    map[s.key] = s.value || "";
  });
  return map;
};

describe("Site settings map builder", () => {
  it("builds a key-value map from settings data", () => {
    const data: SiteSetting[] = [
      { key: "hero_title", value: "BEHT JAMAA", section: "home" },
      { key: "contact_email", value: "test@test.com", section: "contact" },
    ];
    const map = buildSettingsMap(data);
    expect(map.hero_title).toBe("BEHT JAMAA");
    expect(map.contact_email).toBe("test@test.com");
  });

  it("treats null values as empty string", () => {
    const data: SiteSetting[] = [
      { key: "hero_subtitle", value: null, section: "home" },
    ];
    const map = buildSettingsMap(data);
    expect(map.hero_subtitle).toBe("");
  });

  it("overwrites duplicate keys with last value", () => {
    const data: SiteSetting[] = [
      { key: "key1", value: "first", section: "home" },
      { key: "key1", value: "second", section: "home" },
    ];
    const map = buildSettingsMap(data);
    expect(map.key1).toBe("second");
  });

  it("returns empty object for empty input", () => {
    const map = buildSettingsMap([]);
    expect(map).toEqual({});
  });

  it("handles settings with empty string values", () => {
    const data: SiteSetting[] = [
      { key: "footer_name", value: "", section: "footer" },
    ];
    const map = buildSettingsMap(data);
    expect(map.footer_name).toBe("");
  });

  it("preserves all keys from multi-section data", () => {
    const data: SiteSetting[] = [
      { key: "hero_title", value: "Title", section: "home" },
      { key: "vision", value: "Vision text", section: "home" },
      { key: "contact_email", value: "a@b.com", section: "contact" },
      { key: "donate_bank", value: "Bank", section: "donate" },
    ];
    const map = buildSettingsMap(data);
    expect(Object.keys(map)).toHaveLength(4);
    expect(map.vision).toBe("Vision text");
    expect(map.donate_bank).toBe("Bank");
  });
});
