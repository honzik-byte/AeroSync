import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

type ServerSupabaseClient = ReturnType<typeof createServerSupabaseClient>;

export type AeroclubAccountPerson = {
  id: string;
  name: string;
  email: string | null;
  role: "club_admin" | "pilot";
  status: "active" | "inactive";
  created_at: string;
};

export async function listActiveAeroclubAccountPeople(
  supabase: ServerSupabaseClient,
  aeroclubId: string,
) {
  const { data: members, error: membersError } = await supabase
    .from("aeroclub_members")
    .select("user_id, role, status, created_at")
    .eq("aeroclub_id", aeroclubId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

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
      { name: profile.full_name, email: profile.email },
    ]),
  );

  return (members ?? [])
    .map((member) => ({
      id: member.user_id,
      name: profileMap.get(member.user_id)?.name ?? "Neznámý člen",
      email: profileMap.get(member.user_id)?.email ?? null,
      role: member.role,
      status: member.status,
      created_at: member.created_at,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "cs"));
}

export async function syncLegacyPilotsFromAccountPeople(
  supabase: ServerSupabaseClient,
  aeroclubId: string,
) {
  const accountPeople = await listActiveAeroclubAccountPeople(supabase, aeroclubId);

  if (accountPeople.length === 0) {
    return accountPeople;
  }

  const pilotRows: Database["public"]["Tables"]["pilots"]["Insert"][] = accountPeople.map((person) => ({
    id: person.id,
    aeroclub_id: aeroclubId,
    name: person.name,
    email: person.email,
  }));

  const { error } = await supabase
    .from("pilots")
    .upsert(pilotRows, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  return accountPeople;
}
