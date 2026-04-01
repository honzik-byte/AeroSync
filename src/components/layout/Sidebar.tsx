import Link from "next/link";
import { clsx } from "clsx";
import type { NavigationItem } from "@/lib/authorization";

type SidebarProps = {
  navigationItems: NavigationItem[];
  currentPathname: string;
};

function isNavigationItemActive(itemHref: string, currentPathname: string) {
  if (itemHref === "/dashboard") {
    return currentPathname === "/dashboard";
  }

  return currentPathname === itemHref || currentPathname.startsWith(`${itemHref}/`);
}

export function Sidebar({ navigationItems, currentPathname }: SidebarProps) {
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
            className={clsx(
              "rounded-2xl px-4 py-3 text-sm font-medium transition",
              isNavigationItemActive(item.href, currentPathname)
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
