import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser.isAuthenticated) {
    redirect("/login");
  }

  redirect("/dashboard");
}
