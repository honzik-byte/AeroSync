import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />
      <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <Topbar />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
