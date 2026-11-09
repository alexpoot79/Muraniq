"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LogoImage } from "./Logo";

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

  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        className="label -ml-2 inline-flex h-11 items-center gap-3 px-2 text-on-dark"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <svg aria-hidden="true" width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M0 1h22M0 11h14" />
        </svg>
        <span className="sr-only xs:not-sr-only">Menu</span>
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-stage p-0 text-on-dark backdrop:bg-stage/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="container-gallery grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center border-b border-line-dark">
          <span />
          <LogoImage variant="lockup" height={44} className="h-11 w-auto" />
          <button
            type="button"
            className="label -mr-2 inline-flex h-11 items-center gap-2 justify-self-end px-2"
            onClick={close}
            autoFocus
          >
            Close
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 2l12 12M14 2 2 14" />
            </svg>
          </button>
        </div>
        <nav aria-label="Site" className="container-gallery py-10">
          <ol className="flex flex-col">
            {sections.map((s, i) => (
              <li key={s.href} className="border-b border-line-dark py-5">
                <Link href={s.href} className="group flex items-baseline gap-5" onClick={close}>
                  <span aria-hidden="true" className="numeral w-7 text-base text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[2.375rem] leading-none font-light">{s.label}</span>
                </Link>
                {s.children && (
                  <ul className="mt-3 flex flex-col pl-12">
                    {s.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="inline-flex min-h-11 items-center text-muted-dark hover:text-on-dark" onClick={close}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </dialog>
    </>
  );
}
