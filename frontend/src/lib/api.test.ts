import { describe, expect, it } from "vitest";
import { API_URL, FALLBACK_IMAGE, formatPrice, getImageUrl } from "./api";

describe("formatPrice", () => {
  it("converts cents to a dollar string", () => {
    expect(formatPrice(1550)).toBe("$15.50");
    expect(formatPrice(5)).toBe("$0.05");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("getImageUrl", () => {
  it("falls back when there is no url", () => {
    expect(getImageUrl(undefined)).toBe(FALLBACK_IMAGE);
    expect(getImageUrl("")).toBe(FALLBACK_IMAGE);
  });
  it("keeps absolute urls", () => {
    expect(getImageUrl("https://cdn.test/a.jpg")).toBe(
      "https://cdn.test/a.jpg",
    );
  });
  it("prefixes relative urls with the API url", () => {
    expect(getImageUrl("/uploads/a.jpg")).toBe(`${API_URL}/uploads/a.jpg`);
    expect(getImageUrl("uploads/a.jpg")).toBe(`${API_URL}/uploads/a.jpg`);
  });
});
