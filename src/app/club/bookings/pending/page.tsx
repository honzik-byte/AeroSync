import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { Card } from "@/components/ui/Card";
import { PendingBookingsClient } from "@/components/club/PendingBookingsClient";

export const dynamic = "force-dynamic";

function renderAccessNotice(message: string) {
  return (
    <Card className="border-rose-200 bg-rose-50">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Přístup odmítnut</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Čekající rezervace</h1>
      <p className="mt-3 text-slate-700">{message}</p>
    </Card>
  );
}

export default async function PendingBookingsPage() {
  try {
    const currentUser = await getCurrentUser();
    requireClubAdmin(currentUser);

    if (!currentUser.aeroclubId) {
      return renderAccessNotice(
        "Nelze určit aktivní aeroklub. Zkontroluj, že máš právě jedno aktivní členství.",
      );
    }

    const supabase = createServerSupabaseClient();

    const [{ data: club, error: clubError }, { data: bookings, error: bookingsError }] =
      await Promise.all([
        supabase.from("aeroclubs").select("id, name").eq("id", currentUser.aeroclubId).maybeSingle(),
        supabase
          .from("bookings")
          .select("id, airplane_id, pilot_id, start_time, end_time, requested_by_user_id, rejection_reason, created_at")
          .eq("aeroclub_id", currentUser.aeroclubId)
          .eq("status", "pending")
          .order("start_time", { ascending: true }),
      ]);

    if (clubError) {
      throw new Error(clubError.message);
    }

    if (bookingsError) {
      throw new Error(bookingsError.message);
    }

    const airplaneIds = Array.from(new Set((bookings ?? []).map((booking) => booking.airplane_id)));
    const pilotIds = Array.from(new Set((bookings ?? []).map((booking) => booking.pilot_id)));
    const requesterIds = Array.from(
      new Set(
        (bookings ?? [])
          .map((booking) => booking.requested_by_user_id)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    );

    const [{ data: airplanes, error: airplanesError }, { data: pilots, error: pilotsError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        airplaneIds.length
          ? supabase.from("airplanes").select("id, name, type").eq("aeroclub_id", currentUser.aeroclubId).in("id", airplaneIds)
          : Promise.resolve({ data: [], error: null }),
        pilotIds.length
          ? supabase.from("pilots").select("id, name").eq("aeroclub_id", currentUser.aeroclubId).in("id", pilotIds)
          : Promise.resolve({ data: [], error: null }),
        requesterIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", requesterIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (airplanesError) {
      throw new Error(airplanesError.message);
    }

    if (pilotsError) {
      throw new Error(pilotsError.message);
    }

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    const airplaneMap = new Map((airplanes ?? []).map((airplane) => [airplane.id, airplane]));
    const pilotMap = new Map((pilots ?? []).map((pilot) => [pilot.id, pilot.name]));
    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Rezervace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Čekající rezervace</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            {club ? `Rezervace čekající na schválení v aeroklubu ${club.name}.` : "Rezervace čekající na schválení."}
          </p>
        </div>

        <PendingBookingsClient
          bookings={(bookings ?? []).map((booking) => ({
            id: booking.id,
            airplaneName: airplaneMap.get(booking.airplane_id)?.name ?? "Neznámé letadlo",
            airplaneType: airplaneMap.get(booking.airplane_id)?.type ?? "",
            pilotName: pilotMap.get(booking.pilot_id) ?? "Neznámý pilot",
            requestedByName:
              profileMap.get(booking.requested_by_user_id ?? "") ?? "Neznámý žadatel",
            start_time: booking.start_time,
            end_time: booking.end_time,
            rejectionReason: booking.rejection_reason,
            createdAt: booking.created_at,
          }))}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Uživatel není přihlášený.") {
        return renderAccessNotice(error.message);
      }

      if (error.message === "Je potřeba role klubového admina.") {
        return renderAccessNotice(error.message);
      }
    }

    throw error;
  }
}
