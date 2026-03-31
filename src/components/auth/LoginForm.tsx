"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm() {
  const router = useRouter()
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<Key extends keyof LoginFormValues>(key: Key, value: LoginFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(payload.message ?? "Přihlášení se nezdařilo.")
      }

      router.push("/dashboard")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Přihlášení se nezdařilo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-email">
          E-mail
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-password">
          Heslo
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
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
          {isSubmitting ? "Přihlašuji..." : "Přihlásit se"}
        </Button>
      </div>
    </form>
  )
}
