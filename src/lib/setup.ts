export function isSupabaseSetupError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Could not find the table 'public.aeroclubs'") ||
    error.message.includes("Aktivní aeroklub nebyl nalezen.") ||
    error.message.includes("Nepodařilo se načíst aktivní aeroklub")
  );
}
