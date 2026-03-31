import { getCurrentUser } from "@/lib/currentUser";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { requireSuperAdmin } from "@/lib/authorization";
import { AeroclubsPageClient } from "@/components/admin/AeroclubsPageClient";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

function renderAccessNotice(message: string) {
  return (
    <Card className="border-rose-200 bg-rose-50">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Přístup odmítnut</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Správa aeroklubů</h1>
      <p className="mt-3 text-slate-700">{message}</p>
    </Card>
  );
}

export default async function AeroclubsPage() {
  try {
    const currentUser = await getCurrentUser();
    requireSuperAdmin(currentUser);

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("aeroclubs")
      .select("id, name, slug, created_at")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return <AeroclubsPageClient aeroclubs={data ?? []} />;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Uživatel není přihlášený." ||
        error.message === "Je potřeba role super admina."
      ) {
        return renderAccessNotice(error.message);
      }
    }

    throw error;
  }
}
