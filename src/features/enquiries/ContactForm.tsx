"use client";

import { useEffect, useRef, useState } from "react";
import { ENQUIRY_LIMITS, validateEnquiry, type FieldErrors } from "./validate";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "accepted"; requestId?: string }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "error"; message: string };

function ErrorText({ errors, name }: { errors: FieldErrors; name: keyof FieldErrors }) {
  return errors[name] ? (
    <p id={`${name}-error`} className="text-sm font-medium text-[#8a1c1c]">
      {errors[name]}
    </p>
  ) : null;
}

/**
 * Works without JavaScript (native POST → 303 back to /contact/?status=…).
 * With JavaScript it validates inline and shows the real server outcome.
 * "Sent" is only shown when the mail provider accepted the message.
 */
export function ContactForm({
  object,
  initialStatus,
  fallbackEmail,
}: {
  object?: { id: string; title: string };
  initialStatus?: string;
  fallbackEmail: string;
}) {
  const [state, setState] = useState<State>(
    initialStatus === "accepted"
      ? { kind: "accepted" }
      : initialStatus === "invalid"
        ? { kind: "error", message: "Some fields need attention. Please check the form and try again." }
        : initialStatus === "failed"
          ? { kind: "error", message: `Your message could not be sent. Please try again, or email ${fallbackEmail}.` }
          : { kind: "idle" },
  );
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);
  useEffect(() => {
    if (state.kind === "accepted" || state.kind === "error") statusRef.current?.focus();
  }, [state.kind]);

  const errors = state.kind === "invalid" ? state.errors : {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const local = validateEnquiry({ ...raw, startedAt: undefined });
    if (!local.ok && local.kind === "invalid") {
      setState({ kind: "invalid", errors: local.errors });
      const first = Object.keys(local.errors)[0];
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(raw),
        signal: AbortSignal.timeout(15000),
      });
      const body = (await res.json().catch(() => ({}))) as {
        status?: string;
        errors?: FieldErrors;
        requestId?: string;
      };
      if (res.ok && body.status === "accepted") {
        form.reset();
        setState({ kind: "accepted", requestId: body.requestId });
      } else if (body.status === "invalid" && body.errors) {
        setState({ kind: "invalid", errors: body.errors });
      } else if (res.status === 429) {
        setState({ kind: "error", message: "Too many messages in a short time. Please wait a moment and try again." });
      } else {
        setState({
          kind: "error",
          message: `Your message could not be sent. Please try again, or email ${fallbackEmail}.${body.requestId ? ` (Reference ${body.requestId})` : ""}`,
        });
      }
    } catch {
      setState({
        kind: "error",
        message: `The connection timed out or failed. Your message may not have been sent — please try again, or email ${fallbackEmail}.`,
      });
    }
  }

  const field = (name: keyof FieldErrors) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  if (state.kind === "accepted") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-ink p-6 focus:outline-none">
        <h2 className="display-md">Thank you — your message has been sent.</h2>
        <p className="mt-3">
          It was accepted for delivery to MURANIQ. We reply personally, usually by email. If you do not hear from us,
          please write to <a href={`mailto:${fallbackEmail}`} className="link-quiet">{fallbackEmail}</a>.
        </p>
      </div>
    );
  }

  return (
    <form action="/api/contact/" method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
        {state.kind === "error" && (
          <p role="alert" className="border-l-4 border-[#8a1c1c] bg-paper-2 p-4">
            {state.message}
          </p>
        )}
        {state.kind === "invalid" && (
          <p role="alert" className="border-l-4 border-[#8a1c1c] bg-paper-2 p-4">
            Please correct the highlighted fields.
          </p>
        )}
      </div>

      {object && (
        <div className="border border-line-paper bg-paper-2 p-4">
          <p className="label text-ink-muted">About this work</p>
          <p className="mt-1">
            {object.title} <span className="font-mono text-sm text-ink-muted">({object.id})</span>
          </p>
          <input type="hidden" name="objectId" value={object.id} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" autoComplete="name" required maxLength={ENQUIRY_LIMITS.name} className="field" {...field("name")} />
        <ErrorText errors={errors} name="name" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={ENQUIRY_LIMITS.email} className="field" {...field("email")} />
        <ErrorText errors={errors} name="email" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={7} required maxLength={ENQUIRY_LIMITS.message} className="field" {...field("message")} />
        <ErrorText errors={errors} name="message" />
      </div>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" ref={startedRef} defaultValue="" />

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" value="yes" required className="mt-1 h-5 w-5 accent-[var(--color-ink)]" {...field("consent")} />
          <span>
            MURANIQ may use my name and email address to reply to this message. See the{" "}
            <a href="/privacy/" className="link-quiet">privacy notice</a>.
          </span>
        </label>
        <ErrorText errors={errors} name="consent" />
      </div>

      <div>
        <button type="submit" className="btn btn-ink" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
