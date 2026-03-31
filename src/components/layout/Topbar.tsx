export function Topbar() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Aktivní aeroklub</p>
        <h1 className="text-2xl font-semibold text-slate-900">AeroSync</h1>
      </div>
      <div className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
        Interní rezervační systém MVP
      </div>
    </div>
  );
}
