"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

type RegisterFormValues = {
  fullName: string
  email: string
  password: string
  inviteCode: string
}

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: "",
    email: "",
    password: "",
    inviteCode: "",
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<Key extends keyof RegisterFormValues>(key: Key, value: RegisterFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(payload.message ?? "Registrace se nezdařila.")
      }

      window.location.assign("/dashboard")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registrace se nezdařila.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-full-name">
          Jméno a příjmení
        </label>
        <input
          id="register-full-name"
          name="fullName"
          required
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-email">
          E-mail
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-password">
          Heslo
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          minLength={8}
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-invite-code">
          Pozvánkový kód
        </label>
        <input
          id="register-invite-code"
          name="inviteCode"
          required
          value={values.inviteCode}
          onChange={(event) => updateField("inviteCode", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Vytvářím účet..." : "Registrovat se"}
        </Button>
      </div>
    </form>
  )
}
