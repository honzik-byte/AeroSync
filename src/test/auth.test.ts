import { describe, expect, it } from "vitest";
import type { AeroclubMember } from "@/types";

describe("AeroclubMember type", () => {
  it("umožňuje klubovou roli pilot", () => {
    const member: AeroclubMember = {
      id: "member-1",
      aeroclub_id: "club-1",
      user_id: "user-1",
      role: "pilot",
      status: "active",
      created_at: "2026-03-31T10:00:00.000Z",
    };

    expect(member.role).toBe("pilot");
  });
});
