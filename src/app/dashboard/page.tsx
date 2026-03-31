export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-8">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-sm backdrop-blur">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
          AeroSync MVP
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">Přehled</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Základ projektu je připravený. Další kroky doplní statistiky, kalendář a správu letadel,
          pilotů a rezervací.
        </p>
      </section>
    </main>
  );
}
