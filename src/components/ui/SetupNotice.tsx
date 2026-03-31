import { Card } from "@/components/ui/Card";

type SetupNoticeProps = {
  title: string;
  description: string;
};

export function SetupNotice({ title, description }: SetupNoticeProps) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Setup potřeba</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-700">{description}</p>
      <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600">
        Otevři v Supabase `SQL Editor`, vlož obsah souboru `supabase/schema.sql` a spusť ho.
      </div>
    </Card>
  );
}
