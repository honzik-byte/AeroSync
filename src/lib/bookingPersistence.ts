import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

type ServerSupabaseClient = ReturnType<typeof createServerSupabaseClient>;

function isMissingColumnError(error: unknown, table: string, column: string) {
  return (
    error instanceof Error &&
    error.message.includes(`column ${table}.${column} does not exist`)
  );
}

export async function listBookingsForConflictCheck(
  supabase: ServerSupabaseClient,
  aeroclubId: string,
  airplaneId: string,
) {
  const primaryQuery = await supabase
    .from("bookings")
    .select("id, start_time, end_time, status")
    .eq("aeroclub_id", aeroclubId)
    .eq("airplane_id", airplaneId);

  if (!primaryQuery.error) {
    return primaryQuery.data ?? [];
  }

  if (!isMissingColumnError(primaryQuery.error, "bookings", "status")) {
    throw new Error(primaryQuery.error.message);
  }

  const fallbackQuery = await supabase
    .from("bookings")
    .select("id, start_time, end_time")
    .eq("aeroclub_id", aeroclubId)
    .eq("airplane_id", airplaneId);

  if (fallbackQuery.error) {
    throw new Error(fallbackQuery.error.message);
  }

  return (fallbackQuery.data ?? []).map((booking) => ({
    ...booking,
    status: "approved" as const,
  }));
}

export async function createBookingWithSchemaCompatibility(
  supabase: ServerSupabaseClient,
  booking: Database["public"]["Tables"]["bookings"]["Insert"],
) {
  const primaryInsert = await supabase.from("bookings").insert(booking);

  if (!primaryInsert.error) {
    return;
  }

  const missingStatus = isMissingColumnError(primaryInsert.error, "bookings", "status");
  const missingRequester = isMissingColumnError(
    primaryInsert.error,
    "bookings",
    "requested_by_user_id",
  );

  if (!missingStatus && !missingRequester) {
    throw new Error(primaryInsert.error.message);
  }

  const legacyBooking = {
    aeroclub_id: booking.aeroclub_id,
    airplane_id: booking.airplane_id,
    pilot_id: booking.pilot_id,
    start_time: booking.start_time,
    end_time: booking.end_time,
  };

  const fallbackInsert = await supabase.from("bookings").insert(legacyBooking);

  if (fallbackInsert.error) {
    throw new Error(fallbackInsert.error.message);
  }
}
