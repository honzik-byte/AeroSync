import { describe, expect, it } from "vitest";
import { formatTimeLabel } from "@/lib/dates";

describe("formatTimeLabel", () => {
  it("formátuje čas do českého 24hodinového formátu", () => {
    expect(formatTimeLabel(new Date("2026-03-31T08:15:00Z"))).toBe("08:15");
  });
});
