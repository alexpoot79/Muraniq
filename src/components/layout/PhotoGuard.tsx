"use client";

import { useEffect } from "react";

/**
 * Deterrence for MURANIQ's own photographs (marked `data-own-photo`):
 * no right-click menu ("Save image as…", "Copy image") and no dragging the
 * picture out of the page. Museum and reference images are not affected, and
 * links around a photograph keep their normal menu (see globals.css).
 * Screenshots cannot be prevented; the corner mark and the copyright line in
 * the file establish ownership.
 */
export function PhotoGuard() {
  useEffect(() => {
    const onOwnPhoto = (target: EventTarget | null) => target instanceof Element && target.closest("[data-own-photo]") !== null;
    const block = (e: Event) => {
      if (onOwnPhoto(e.target)) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
