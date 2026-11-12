"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * Remembers the last collection listing (with its filters, page and scroll
 * position) for this tab, so an object page can offer a way back to exactly
 * that selection. sessionStorage only; nothing leaves the browser. Without
 * storage the breadcrumb remains the way back.
 */
const KEY = "muraniq:listing";
const RESTORE = "muraniq:listing-restore";

type Stored = { href: string; label: string; y: number };
const noop = () => () => {};

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Stored | null {
  try {
    const v = JSON.parse(raw ?? "null") as Stored | null;
    return v && typeof v.href === "string" && v.href.startsWith("/collection/") ? v : null;
  } catch {
    return null;
  }
}

function save(v: Stored) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable: nothing to remember */
  }
}

/** Placed on a listing page: records its URL and keeps the scroll position up to date. */
export function RememberListing({ label }: { label: string }) {
  useEffect(() => {
    const href = window.location.pathname + window.location.search;
    let restore: string | null = null;
    try {
      restore = window.sessionStorage.getItem(RESTORE);
      window.sessionStorage.removeItem(RESTORE);
    } catch {
      restore = null;
    }
    const prev = parse(readRaw());
    let raf = 0;
    let restoreRaf = 0;
    if (restore === href && prev?.href === href && prev.y > 0) {
      // The router may still be settling its own scroll; retry for a few frames until the position holds.
      let tries = 0;
      const target = prev.y;
      const go = () => {
        window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
        if (Math.abs(window.scrollY - target) > 2 && tries++ < 30) restoreRaf = requestAnimationFrame(go);
      };
      restoreRaf = requestAnimationFrame(go);
    }
    save({ href, label, y: restore === href && prev ? prev.y : window.scrollY });
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Ignore the scroll to the top that comes with leaving for another page.
        if (window.location.pathname + window.location.search === href) save({ href, label, y: window.scrollY });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(restoreRaf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [label]);
  return null;
}

/** Placed on an object page: a link back to the remembered selection, if there is one. */
export function BackToListing({ className = "" }: { className?: string }) {
  // Read after hydration only: the server has no listing to go back to.
  const raw = useSyncExternalStore(noop, readRaw, () => null);
  const stored = useMemo(() => parse(raw), [raw]);
  if (!stored) return null;
  return (
    <Link
      href={stored.href}
      scroll={false}
      className={`label inline-flex min-h-11 items-center gap-3 text-muted-dark transition-colors hover:text-on-dark ${className}`}
      onClick={() => {
        try {
          window.sessionStorage.setItem(RESTORE, stored.href);
        } catch {
          /* ignore */
        }
      }}
    >
      <svg aria-hidden="true" width="22" height="8" viewBox="0 0 22 8" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M22 4H1M4.5 0.5 1 4l3.5 3.5" />
      </svg>
      Back to {stored.label}
    </Link>
  );
}
