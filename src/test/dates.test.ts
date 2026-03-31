import { describe, expect, it } from "vitest";
import { formatTimeLabel } from "@/lib/dates";

describe("formatTimeLabel", () => {
  it("formátuje čas do českého času pro Prahu", () => {
    expect(formatTimeLabel(new Date("2026-03-31T08:15:00Z"))).toBe("10:15");
  });
});
