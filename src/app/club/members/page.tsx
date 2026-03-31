import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { Card } from "@/components/ui/Card";
import { MembersClient } from "@/components/club/MembersClient";

export const dynamic = "force-dynamic";

function renderAccessNotice(message: string) {
  return (
    <Card className="border-rose-200 bg-rose-50">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Přístup odmítnut</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Správa členů</h1>
      <p className="mt-3 text-slate-700">{message}</p>
    </Card>
  );
}

export default async function ClubMembersPage() {
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

    const { data: members, error: membersError } = await supabase
      .from("aeroclub_members")
      .select("id, user_id, role, status, created_at")
      .eq("aeroclub_id", currentUser.aeroclubId)
      .order("created_at", { ascending: false });

    if (membersError) {
      throw new Error(membersError.message);
    }

    const userIds = (members ?? []).map((member) => member.user_id);

    const { data: profiles, error: profilesError } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds)
      : { data: [], error: null };

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        {
          full_name: profile.full_name,
          email: profile.email,
        },
      ]),
    );

    const normalizedMembers = (members ?? []).map((member) => {
      const profile = profileMap.get(member.user_id);

      return {
        id: member.id,
        user_id: member.user_id,
        full_name: profile?.full_name ?? "Neznámý člen",
        email: profile?.email ?? "Bez e-mailu",
        role: member.role,
        status: member.status,
        created_at: member.created_at,
      };
    });

    return <MembersClient clubName={club.name} members={normalizedMembers} />;
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
