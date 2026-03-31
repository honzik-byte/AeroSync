import { getCurrentUser } from "@/lib/currentUser";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { requireSuperAdmin } from "@/lib/authorization";
import { AeroclubDetailClient } from "@/components/admin/AeroclubDetailClient";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

function renderAccessNotice(message: string) {
  return (
    <Card className="border-rose-200 bg-rose-50">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Přístup odmítnut</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Detail aeroklubu</h1>
      <p className="mt-3 text-slate-700">{message}</p>
    </Card>
  );
}

export default async function AeroclubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    requireSuperAdmin(currentUser);

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("aeroclubs")
      .select("id, name, slug, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return (
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Aeroklub nenalezen
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Požadovaný aeroklub neexistuje
          </h1>
          <p className="mt-3 text-slate-600">Zkontroluj prosím odkaz nebo se vrať na seznam klubů.</p>
        </Card>
      );
    }

    return <AeroclubDetailClient aeroclub={data} />;
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
