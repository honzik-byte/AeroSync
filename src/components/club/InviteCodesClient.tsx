"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type InviteCode = {
  id: string;
  code: string;
  is_active: boolean;
  used_by_user_id: string | null;
  used_at: string | null;
  created_at: string;
};

type InviteCodesClientProps = {
  clubName: string;
  inviteCodes: InviteCode[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

function statusLabel(inviteCode: InviteCode) {
  if (inviteCode.used_at || inviteCode.used_by_user_id) {
    return "Použitý";
  }

  if (!inviteCode.is_active) {
    return "Neaktivní";
  }

  return "Nepoužitý";
}

function statusClasses(inviteCode: InviteCode) {
  if (inviteCode.used_at || inviteCode.used_by_user_id) {
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }

  if (!inviteCode.is_active) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

async function readResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: unknown };

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ne-JSON odpověď nebo neplatné tělo.
  }

  return fallbackMessage;
}

export function InviteCodesClient({ clubName, inviteCodes }: InviteCodesClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [createdCode, setCreatedCode] = useState<string>();
  const [isCreatingInviteCode, setIsCreatingInviteCode] = useState(false);
  const activeUnusedCodes = useMemo(
    () =>
      inviteCodes.filter(
        (inviteCode) =>
          !inviteCode.used_at && !inviteCode.used_by_user_id && inviteCode.is_active,
      ),
    [inviteCodes],
  );
  const usedCodes = useMemo(
    () => inviteCodes.filter((inviteCode) => inviteCode.used_at || inviteCode.used_by_user_id),
    [inviteCodes],
  );
  const inactiveUnusedCodes = useMemo(
    () =>
      inviteCodes.filter(
        (inviteCode) =>
          !inviteCode.used_at && !inviteCode.used_by_user_id && !inviteCode.is_active,
      ),
    [inviteCodes],
  );

  async function generateNewInviteCode() {
    if (isCreatingInviteCode) {
      return;
    }

    setIsCreatingInviteCode(true);

    try {
      const response = await fetch("/api/club/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        setErrorMessage(
          await readResponseMessage(
            response,
            "Nepodařilo se vytvořit pozvánkový kód. Zkus to prosím znovu.",
          ),
        );
        return;
      }

      const data = (await response.json()) as { inviteCode?: { code?: string } };
      setCreatedCode(data.inviteCode?.code);
      setErrorMessage(undefined);
      router.refresh();
    } catch {
      setErrorMessage("Nepodařilo se vytvořit pozvánkový kód. Zkus to prosím znovu.");
    } finally {
      setIsCreatingInviteCode(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
          Pozvánkové kódy
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{clubName}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Vytvářej nové kódy pro registraci členů a sleduj, které už byly použity.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={generateNewInviteCode}
            disabled={isCreatingInviteCode}
            aria-busy={isCreatingInviteCode}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingInviteCode ? "Vytvářím kód..." : "Vygenerovat nový kód"}
          </Button>
          <div className="text-sm text-slate-500">
            Aktivních nepoužitých kódů:{" "}
            <span className="font-semibold text-slate-900">{activeUnusedCodes.length}</span>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Chyba</p>
          <p className="mt-2 text-rose-800">{errorMessage}</p>
        </Card>
      ) : null}

      {createdCode ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
            Nový kód
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.2em] text-emerald-900">
            {createdCode}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Nepoužité
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Aktivní kódy</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              {activeUnusedCodes.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {activeUnusedCodes.length === 0 ? (
              <p className="text-sm text-slate-500">Žádné nepoužité kódy.</p>
            ) : (
              activeUnusedCodes.map((inviteCode) => (
                <div
                  key={inviteCode.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-mono text-lg font-semibold tracking-[0.12em] text-slate-900">
                      {inviteCode.code}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Vytvořeno {formatDate(inviteCode.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClasses(inviteCode)}`}
                  >
                    {statusLabel(inviteCode)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Použité a neaktivní
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Historie kódů</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              {usedCodes.length + inactiveUnusedCodes.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {usedCodes.length + inactiveUnusedCodes.length === 0 ? (
              <p className="text-sm text-slate-500">Zatím nebyl použit žádný kód.</p>
            ) : (
              [...usedCodes, ...inactiveUnusedCodes].map((inviteCode) => (
                <div
                  key={inviteCode.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-mono text-lg font-semibold tracking-[0.12em] text-slate-900">
                      {inviteCode.code}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Vytvořeno {formatDate(inviteCode.created_at)}
                      {inviteCode.used_at ? ` · použito ${formatDate(inviteCode.used_at)}` : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClasses(inviteCode)}`}
                  >
                    {statusLabel(inviteCode)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
