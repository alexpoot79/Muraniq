"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";

const MULTI = ["category", "technique", "maker", "attribution", "colour"];

/**
 * Progressive enhancement around a plain GET form. Without JavaScript the form
 * submits normally. With JavaScript, desktop filter changes apply immediately
 * (soft navigation, URL stays the source of truth, back/forward restore).
 * On small screens changes wait for the explicit Apply button.
 */
export function FilterForm({
  action,
  children,
  className,
}: {
  action: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function navigate(form: HTMLFormElement) {
    const fd = new FormData(form);
    const sp = new URLSearchParams();
    const q = String(fd.get("q") ?? "").trim();
    if (q) sp.set("q", q);
    for (const key of MULTI) {
      const vals = fd.getAll(key).map(String).filter(Boolean).sort();
      if (vals.length) sp.set(key, vals.join(","));
    }
    for (const key of ["from", "to"]) {
      const v = String(fd.get(key) ?? "").trim();
      if (v) sp.set(key, v);
    }
    const sort = String(fd.get("sort") ?? "curated");
    if (sort !== "curated") sp.set("sort", sort);
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${action}?${qs}` : action, { scroll: false }));
  }

  return (
    <form
      ref={ref}
      action={action}
      method="get"
      role="search"
      aria-busy={pending}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(e.currentTarget);
      }}
      onChange={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        if (t.name === "q" || t.name === "from" || t.name === "to") return; // typed fields wait for submit
        if (t.name === "sort" || window.matchMedia("(min-width: 64rem)").matches) navigate(e.currentTarget);
      }}
    >
      {children}
    </form>
  );
}
