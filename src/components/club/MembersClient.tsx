"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type ClubMember = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: "club_admin" | "pilot";
  status: "active" | "inactive";
  created_at: string;
};

type MembersClientProps = {
  clubName: string;
  members: ClubMember[];
};

type MemberDraft = {
  role: "club_admin" | "pilot";
  status: "active" | "inactive";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

function roleLabel(role: ClubMember["role"]) {
  return role === "club_admin" ? "Klubový admin" : "Pilot";
}

function statusLabel(status: ClubMember["status"]) {
  return status === "active" ? "Aktivní" : "Neaktivní";
}

function statusBadgeClasses(status: ClubMember["status"]) {
  return status === "active"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
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

export function MembersClient({ clubName, members }: MembersClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [drafts, setDrafts] = useState<Record<string, MemberDraft>>({});

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        members.map((member) => [
          member.id,
          { role: member.role, status: member.status },
        ]),
      ),
    );
  }, [members]);

  const counts = useMemo(() => {
    const active = members.filter((member) => member.status === "active").length;
    const inactive = members.length - active;
    const admins = members.filter((member) => member.role === "club_admin").length;

    return { active, inactive, admins };
  }, [members]);

  async function updateMember(memberId: string, nextDraft: MemberDraft) {
    try {
      const response = await fetch(`/api/club/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextDraft),
      });

      if (!response.ok) {
        setErrorMessage(
          await readResponseMessage(response, "Nepodařilo se upravit člena. Zkus to prosím znovu."),
        );
        return;
      }

      setErrorMessage(undefined);
      router.refresh();
    } catch {
      setErrorMessage("Nepodařilo se upravit člena. Zkus to prosím znovu.");
    }
  }

  async function deactivateMember(memberId: string) {
    const member = members.find((item) => item.id === memberId);
    const currentDraft = drafts[memberId] ?? {
      role: member?.role ?? "pilot",
      status: member?.status ?? "inactive",
    };

    if (!member) {
      return;
    }

    await updateMember(memberId, {
      role: currentDraft.role,
      status: "inactive",
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          Členství klubu
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{clubName}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Upravuj role členů a případně jim pozastav přístup do klubu. Změny se ukládají
          okamžitě přes API.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Card className="bg-white/80">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Celkem</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{members.length}</p>
          </Card>
          <Card className="bg-white/80">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Aktivní
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.active}</p>
          </Card>
          <Card className="bg-white/80">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Admini
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.admins}</p>
          </Card>
        </div>
      </div>

      {errorMessage ? (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Chyba</p>
          <p className="mt-2 text-rose-800">{errorMessage}</p>
        </Card>
      ) : null}

      {members.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-slate-900">Žádní členové</p>
          <p className="mt-2 text-slate-600">
            V tomhle klubu zatím nejsou aktivní žádní členové.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => {
            const draft = drafts[member.id] ?? {
              role: member.role,
              status: member.status,
            };

            return (
              <Card key={member.id} className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900">{member.full_name}</h2>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClasses(member.status)}`}
                      >
                        {statusLabel(member.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      Přidáno {formatDate(member.created_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <div>
                      Role: <span className="font-medium text-slate-900">{roleLabel(member.role)}</span>
                    </div>
                    <div>
                      Stav: <span className="font-medium text-slate-900">{statusLabel(member.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Role</span>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                      value={draft.role}
                      onChange={(event) => {
                        const role = event.target.value as MemberDraft["role"];
                        setDrafts((current) => ({
                          ...current,
                          [member.id]: {
                            ...(current[member.id] ?? draft),
                            role,
                          },
                        }));
                      }}
                    >
                      <option value="pilot">Pilot</option>
                      <option value="club_admin">Klubový admin</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Stav</span>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                      value={draft.status}
                      onChange={(event) => {
                        const status = event.target.value as MemberDraft["status"];
                        setDrafts((current) => ({
                          ...current,
                          [member.id]: {
                            ...(current[member.id] ?? draft),
                            status,
                          },
                        }));
                      }}
                    >
                      <option value="active">Aktivní</option>
                      <option value="inactive">Neaktivní</option>
                    </select>
                  </label>

                  <div className="flex items-end gap-2">
                    <Button
                      className="w-full"
                      onClick={() => updateMember(member.id, draft)}
                    >
                      Uložit změny
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => deactivateMember(member.id)}
                      disabled={member.status === "inactive"}
                    >
                      Deaktivovat
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
