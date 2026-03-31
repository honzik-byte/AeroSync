import { Button } from "@/components/ui/Button";

export function CalendarToolbar() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Týdenní pohled</p>
        <h2 className="text-xl font-semibold text-slate-900">31. března – 6. dubna 2026</h2>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary">Předchozí týden</Button>
        <Button variant="secondary">Další týden</Button>
      </div>
    </div>
  );
}
