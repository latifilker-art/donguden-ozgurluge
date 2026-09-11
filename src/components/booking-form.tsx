"use client";

import { useActionState } from "react";
import type { RequestAppointmentState } from "@/app/(public)/egitmenler/[slug]/actions";

const initialState: RequestAppointmentState = { error: null };

export function BookingForm({
  instructorId,
  sessionOptions,
  action,
}: {
  instructorId: string;
  sessionOptions: string[];
  action: (
    instructorId: string,
    formData: FormData,
  ) => Promise<RequestAppointmentState>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: RequestAppointmentState, formData: FormData) =>
      action(instructorId, formData),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="sessionType"
          className="mb-1.5 block text-sm font-medium text-ink-soft"
        >
          Seans türü
        </label>
        <select
          id="sessionType"
          name="sessionType"
          required
          className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {sessionOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1.5 text-sm font-medium text-ink-soft">
          Tercih ettiğin zaman
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            name="date"
            required
            aria-label="Tercih ettiğin tarih"
            className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <input
            type="time"
            name="time"
            required
            aria-label="Tercih ettiğin saat"
            className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="note"
          className="mb-1.5 block text-sm font-medium text-ink-soft"
        >
          Not (opsiyonel)
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Ne konuda destek istediğini kısaca yaz…"
          className="w-full resize-y rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-neg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Randevu Talebini Gönder"}
      </button>
      <p className="text-center text-xs text-ink-faint">
        Talep onaylanana kadar takviminde yer tutulmaz.
      </p>
    </form>
  );
}
