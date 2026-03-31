import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">AeroSync</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Přihlášení do systému
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Přihlas se e-mailem a heslem, abys mohl spravovat rezervace, piloty a svůj aeroklub.
          </p>
          <p className="text-sm text-slate-500">
            Nemáš ještě účet?{" "}
            <Link href="/register" className="font-medium text-sky-700 underline-offset-4 hover:underline">
              Zaregistruj se pomocí pozvánkového kódu
            </Link>
            .
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <LoginForm />
        </section>
      </div>
    </main>
  )
}
