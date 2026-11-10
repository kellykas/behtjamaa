import { describe, expect, it } from "vitest";
import { optimizedImageUrl } from "@/lib/utils";

const hero = "https://oanwtlbhejghtstryefe.supabase.co/storage/v1/object/public/profile-avatars/hero.jpg";

describe("optimizedImageUrl", () => {
  it("rewrites a public storage URL to a resized WebP variant", () => {
    expect(optimizedImageUrl(hero, 800)).toBe(
      "https://oanwtlbhejghtstryefe.supabase.co/storage/v1/render/image/public/profile-avatars/hero.jpg?width=800&quality=70&format=webp",
    );
  });

  it("snaps the requested width to the next shared step", () => {
    expect(optimizedImageUrl(hero, 300)).toContain("width=320");
    expect(optimizedImageUrl(hero, 801)).toContain("width=1024");
  });

  it("caps the width at the largest step", () => {
    expect(optimizedImageUrl(hero, 4000)).toContain("width=1600");
  });

  it("keeps at most the largest step when the width is tiny", () => {
    expect(optimizedImageUrl(hero, 1)).toContain("width=64");
  });

  it("honours a custom quality", () => {
    expect(optimizedImageUrl(hero, 800, 55)).toContain("quality=55");
  });

  it("preserves unrelated query parameters", () => {
    expect(optimizedImageUrl(`${hero}?download=1`, 240)).toContain("download=1");
  });

  it("leaves non-Supabase URLs alone", () => {
    const external = "https://cdn.example.com/photo.jpg";
    expect(optimizedImageUrl(external, 800)).toBe(external);
  });

  it("leaves signed storage URLs alone, since the token would be rejected", () => {
    const signed =
      "https://oanwtlbhejghtstryefe.supabase.co/storage/v1/object/sign/profile-avatars/hero.jpg?token=abc";
    expect(optimizedImageUrl(signed, 800)).toBe(signed);
  });

  it("leaves SVG uploads alone, since the renderer cannot transform them", () => {
    const svg = `${hero.replace("hero.jpg", "logo.svg")}`;
    expect(optimizedImageUrl(svg, 160)).toBe(svg);
  });

  it("leaves an already rendered URL alone", () => {
    const rendered = `${hero.replace("/object/public/", "/render/image/public/")}?width=800`;
    expect(optimizedImageUrl(rendered, 400)).toBe(rendered);
  });

  it("returns an empty string unchanged", () => {
    expect(optimizedImageUrl("", 800)).toBe("");
  });
});
