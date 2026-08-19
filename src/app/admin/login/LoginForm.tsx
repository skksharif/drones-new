"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

const FIELD =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 " +
  "outline-none transition-colors placeholder:text-ink-400 focus:border-brand-700/50 " +
  "focus:ring-2 focus:ring-brand-700/15";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-ink-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-brand-700/20 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800"
        >
          {state.error}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}
