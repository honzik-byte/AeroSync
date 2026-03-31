import { describe, expect, it } from "vitest";
import { getActiveAeroclubSlug } from "@/lib/config";
import { formatTimeLabel } from "@/lib/dates";

describe("formatTimeLabel", () => {
  it("formátuje čas do českého času pro Prahu", () => {
    expect(formatTimeLabel(new Date("2026-03-31T08:15:00Z"))).toBe("10:15");
  });
});

describe("getActiveAeroclubSlug", () => {
  it("vrací slug aktivního aeroklubu z konfigurace", () => {
    const originalValue = process.env.ACTIVE_AEROCLUB_SLUG;

    try {
      process.env.ACTIVE_AEROCLUB_SLUG = "aeroklub-brno";

      expect(getActiveAeroclubSlug()).toBe("aeroklub-brno");
    } finally {
      if (originalValue === undefined) {
        delete process.env.ACTIVE_AEROCLUB_SLUG;
      } else {
        process.env.ACTIVE_AEROCLUB_SLUG = originalValue;
      }
    }
  });

  it("selže, když ACTIVE_AEROCLUB_SLUG není nastavený", () => {
    const originalValue = process.env.ACTIVE_AEROCLUB_SLUG;

    try {
      delete process.env.ACTIVE_AEROCLUB_SLUG;

      expect(() => getActiveAeroclubSlug()).toThrow("Chybí proměnná ACTIVE_AEROCLUB_SLUG.");
    } finally {
      if (originalValue === undefined) {
        delete process.env.ACTIVE_AEROCLUB_SLUG;
      } else {
        process.env.ACTIVE_AEROCLUB_SLUG = originalValue;
      }
    }
  });
});
