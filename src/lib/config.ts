export function getActiveAeroclubSlug() {
  const value = process.env.ACTIVE_AEROCLUB_SLUG

  if (!value) {
    throw new Error("Chybí proměnná ACTIVE_AEROCLUB_SLUG.")
  }

  return value
}

export function getSupabaseUrl() {
  const value = process.env.SUPABASE_URL

  if (!value) {
    throw new Error("Chybí proměnná SUPABASE_URL.")
  }

  return value
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!value) {
    throw new Error("Chybí proměnná SUPABASE_SERVICE_ROLE_KEY.")
  }

  return value
}
