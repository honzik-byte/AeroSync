import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { Card } from "@/components/ui/Card";
import { InviteCodesClient } from "@/components/club/InviteCodesClient";

export const dynamic = "force-dynamic";

function renderAccessNotice(message: string) {
  return (
    <Card className="border-rose-200 bg-rose-50">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Přístup odmítnut</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Pozvánkové kódy</h1>
      <p className="mt-3 text-slate-700">{message}</p>
    </Card>
  );
}

export default async function ClubInvitesPage() {
  try {
    const currentUser = await getCurrentUser();
    requireClubAdmin(currentUser);

    if (!currentUser.aeroclubId) {
      return renderAccessNotice(
        "Nelze určit aktivní aeroklub. Zkontroluj, že máš právě jedno aktivní členství.",
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: club, error: clubError } = await supabase
      .from("aeroclubs")
      .select("id, name")
      .eq("id", currentUser.aeroclubId)
      .maybeSingle();

    if (clubError) {
      throw new Error(clubError.message);
    }

    if (!club) {
      return renderAccessNotice("Aktivní aeroklub se nepodařilo najít.");
    }

    const { data: inviteCodes, error: inviteCodesError } = await supabase
      .from("aeroclub_invite_codes")
      .select("id, code, is_active, used_by_user_id, used_at, created_at")
      .eq("aeroclub_id", currentUser.aeroclubId)
      .order("created_at", { ascending: false });

    if (inviteCodesError) {
      throw new Error(inviteCodesError.message);
    }

    return (
      <InviteCodesClient clubName={club.name} inviteCodes={inviteCodes ?? []} />
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Uživatel není přihlášený.") {
        return renderAccessNotice(error.message);
      }

      if (error.message === "Je potřeba role klubového admina.") {
        return renderAccessNotice(error.message);
      }

      if (
        error.message ===
        "Nelze určit aktivní aeroklub. Zkontroluj, že máš právě jedno aktivní členství."
      ) {
        return renderAccessNotice(error.message);
      }
    }

    throw error;
  }
}
