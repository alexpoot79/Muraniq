"use client";

import Link from "next/link";
import { useState } from "react";
import { SELECTION_MAX, toggleSelection, useSelection } from "./store";

/**
 * Sets a work aside in the visitor's Private Selection (this browser only).
 * A real toggle button with its state announced; the result is confirmed in
 * a polite live region, including when the browser refuses storage.
 */
export function SaveToSelection({ id, title, className = "" }: { id: string; title: string; className?: string }) {
  const ids = useSelection();
  const saved = ids.includes(id);
  const [message, setMessage] = useState("");

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        aria-pressed={saved}
        className="inline-flex min-h-11 items-center gap-2.5 self-start text-left text-sm text-on-dark transition-colors hover:text-accent"
        onClick={() => {
          const r = toggleSelection(id);
          if (!r.ok && !saved)
            setMessage(
              ids.length >= SELECTION_MAX
                ? `Your selection holds ${SELECTION_MAX} works. Remove one to add another.`
                : "This browser does not allow saving. Your selection cannot be kept.",
            );
          else setMessage(r.saved ? `${title} is saved in your Private Selection.` : `${title} is removed from your Private Selection.`);
        }}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
          <path d="M4 2.5h8v11L8 10.5 4 13.5z" />
        </svg>
        <span className="underline decoration-current/35 underline-offset-[0.22em]">{saved ? "Saved in your Private Selection" : "Save to Private Selection"}</span>
      </button>
      <p aria-live="polite" className="text-caption text-muted-dark">
        {message}
        {message && saved && (
          <>
            {" "}
            <Link href="/selection/" className="link-quiet text-on-dark">
              View selection
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
