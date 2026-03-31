import { Card } from "@/components/ui/Card";

type DashboardCardsProps = {
  airplanesCount: number;
  pilotsCount: number;
  todayBookingsCount: number;
};

export function DashboardCards({
  airplanesCount,
  pilotsCount,
  todayBookingsCount,
}: DashboardCardsProps) {
  const items = [
    { label: "Letadla", value: airplanesCount },
    { label: "Piloti", value: pilotsCount },
    { label: "Dnešní rezervace", value: todayBookingsCount },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm font-medium text-slate-500">{item.label}</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
