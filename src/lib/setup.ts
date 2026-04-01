export function isSupabaseSetupError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Could not find the table 'public.aeroclubs'") ||
    error.message.includes("Could not find the table 'public.aeroclub_invite_codes'") ||
    error.message.includes("Aktivní aeroklub nebyl nalezen.") ||
    error.message.includes("Nepodařilo se načíst aktivní aeroklub") ||
    error.message.includes("column bookings.status does not exist") ||
    error.message.includes("column bookings.requested_by_user_id does not exist")
  );
}
