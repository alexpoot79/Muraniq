"use client";

import { useSyncExternalStore } from "react";

/**
 * Private Selection: works a visitor sets aside, kept only in this browser
 * (localStorage). No account, nothing sent to the server until the visitor
 * opens the selection page, which asks for the public records of these ids.
 * Storage can be unavailable (private windows, blocked site data); every
 * access is guarded and the site works without it.
 */
const KEY = "muraniq:selection";
const EVENT = "muraniq:selection";
export const SELECTION_MAX = 24;
const ID_RE = /^MUR-[A-Z0-9-]+$/;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string" && ID_RE.test(v)).slice(0, SELECTION_MAX) : [];
  } catch {
    return [];
  }
}

let cache: string[] | null = null;
let cacheRaw: string | null = null;

function snapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (cache && raw === cacheRaw) return cache;
  cacheRaw = raw;
  cache = read();
  return cache;
}

const EMPTY: string[] = [];

function write(ids: string[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, SELECTION_MAX)));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** The saved ids, newest first. Empty on the server and before hydration. */
export function useSelection(): string[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function toggleSelection(id: string): { saved: boolean; ok: boolean } {
  const ids = snapshot();
  if (ids.includes(id)) return { saved: false, ok: write(ids.filter((x) => x !== id)) };
  if (ids.length >= SELECTION_MAX) return { saved: false, ok: false };
  return { saved: true, ok: write([id, ...ids]) };
}

export function removeFromSelection(id: string) {
  write(snapshot().filter((x) => x !== id));
}

export function clearSelection() {
  write([]);
}
