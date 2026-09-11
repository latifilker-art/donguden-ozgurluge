"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null, message: null };

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  showName,
}: {
  action: (formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
  pendingLabel: string;
  showName?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: AuthActionState, formData: FormData) => action(formData),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {showName && (
        <div>
          <label
            htmlFor="displayName"
            className="mb-1.5 block text-sm font-medium text-ink-soft"
          >
            Ad
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-ink-soft"
        >
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink-soft"
        >
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={showName ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-neg">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="text-sm text-brand">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
