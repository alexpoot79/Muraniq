"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Item = { label: string; href: string; children?: Array<{ label: string; href: string }> };

/**
 * Full-screen menu on a native <dialog>: modal focus containment, Escape to
 * close and focus restoration to the trigger come from the platform.
 */
export function MobileMenu({ sections }: { sections: Item[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="label inline-flex h-11 items-center gap-2 px-2 text-on-dark"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 6h16M2 14h16" />
        </svg>
        <span className="sr-only xs:not-sr-only">Menu</span>
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-stage p-0 text-on-dark backdrop:bg-stage/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
      >
        <div className="container-gallery flex h-16 items-center justify-end">
          <button
            type="button"
            className="label inline-flex h-11 items-center gap-2 px-2"
            onClick={() => ref.current?.close()}
            autoFocus
          >
            Close
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l12 12M15 3 3 15" />
            </svg>
          </button>
        </div>
        <nav aria-label="Site" className="container-gallery pb-16">
          <ul className="flex flex-col gap-6">
            {sections.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="font-display text-4xl" onClick={() => ref.current?.close()}>
                  {s.label}
                </Link>
                {s.children && (
                  <ul className="mt-3 flex flex-col gap-1 border-l border-line-dark pl-4">
                    {s.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="inline-block py-2 text-muted-dark hover:text-on-dark"
                          onClick={() => ref.current?.close()}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
