import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">AeroSync</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Registrace nového účtu
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Účet vytvoříš jen s platným pozvánkovým kódem. Po registraci budeš automaticky přihlášený.
          </p>
          <p className="text-sm text-slate-500">
            Už účet máš?{" "}
            <Link href="/login" className="font-medium text-sky-700 underline-offset-4 hover:underline">
              Přejdi na přihlášení
            </Link>
            .
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <RegisterForm />
        </section>
      </div>
    </main>
  )
}
