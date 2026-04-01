import { describe, expect, it } from "vitest"
import { resolveRequestPathname } from "@/lib/requestPath"

function createHeaders(entries: Record<string, string | undefined>) {
  return {
    get(name: string) {
      return entries[name]
    },
  }
}

describe("resolveRequestPathname", () => {
  it("prefers middleware pathname header when available", () => {
    const pathname = resolveRequestPathname(
      createHeaders({
        "x-pathname": "/login",
        "x-matched-path": "/dashboard",
      }),
    )

    expect(pathname).toBe("/login")
  })

  it("falls back to matched path when middleware header is missing", () => {
    const pathname = resolveRequestPathname(
      createHeaders({
        "x-matched-path": "/login",
      }),
    )

    expect(pathname).toBe("/login")
  })

  it("extracts pathname from next-url when only full url is available", () => {
    const pathname = resolveRequestPathname(
      createHeaders({
        "next-url": "https://aero-sync-amber.vercel.app/register?via=invite",
      }),
    )

    expect(pathname).toBe("/register")
  })

  it("returns root when no routing headers are present", () => {
    const pathname = resolveRequestPathname(createHeaders({}))

    expect(pathname).toBe("/")
  })
})
