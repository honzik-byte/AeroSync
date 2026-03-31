import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getCurrentUser } from "@/lib/currentUser";

type AppShellProps = {
  children: ReactNode;
};

const authRoutes = new Set(["/login", "/register"]);

export async function AppShell({ children }: AppShellProps) {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const isAuthRoute = authRoutes.has(pathname);
  const currentUser = await getCurrentUser();

  if (!currentUser.isAuthenticated && !isAuthRoute) {
    redirect("/login");
  }

  if (currentUser.isAuthenticated && isAuthRoute) {
    redirect("/dashboard");
  }

  if (isAuthRoute) {
    return <>{children}</>;
  }

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
