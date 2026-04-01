type HeaderSource = {
  get(name: string): string | null | undefined
}

function normalizePathname(value?: string | null) {
  if (!value) {
    return null
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      return new URL(value).pathname
    } catch {
      return null
    }
  }

  if (value.startsWith("/")) {
    return value
  }

  return null
}

export function resolveRequestPathname(headers: HeaderSource) {
  return (
    normalizePathname(headers.get("x-pathname")) ??
    normalizePathname(headers.get("x-matched-path")) ??
    normalizePathname(headers.get("next-url")) ??
    "/"
  )
}
