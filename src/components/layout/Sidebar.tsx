import Link from "next/link";

const navigationItems = [
  { href: "/dashboard", label: "Přehled" },
  { href: "/calendar", label: "Kalendář" },
  { href: "/airplanes", label: "Letadla" },
  { href: "/pilots", label: "Piloti" },
];

export function Sidebar() {
  return (
    <aside className="flex w-full flex-col gap-8 border-b border-slate-200 bg-white px-6 py-6 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          AeroSync
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">Rezervace letadel</div>
      </div>

      <nav className="flex flex-col gap-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
