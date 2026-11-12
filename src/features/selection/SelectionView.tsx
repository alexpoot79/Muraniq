"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { SelectionRecord } from "@/app/api/selection/route";
import { clearSelection, removeFromSelection, useSelection } from "./store";

const MAX_COMPARE = 3;
const one = (v: number) => v.toLocaleString("en-GB", { maximumFractionDigits: 1 });
const cmIn = (mm?: number) => (mm ? `${one(mm / 10)} cm (${one(mm / 25.4)} in)` : "Not recorded");

type Loaded = { key: string; state: "ready" | "error"; records: SelectionRecord[] };
type Load = { state: "idle" | "loading" | "ready" | "error"; records: SelectionRecord[] };
const noop = () => () => {};

/**
 * The visitor's Private Selection and a side-by-side comparison of up to three
 * works. The saved ids live in this browser; the comparison is shareable
 * through the URL (?compare=…), which holds public record ids only.
 */
export function SelectionView() {
  const ids = useSelection();
  const router = useRouter();
  const params = useSearchParams();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  // False during server rendering and hydration, true once running in the browser.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  const compareParam = useMemo(
    () => (params.get("compare") ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE),
    [params],
  );
  // Shared comparison links work even when the works are not in this browser's selection.
  const wanted = useMemo(() => [...new Set([...ids, ...compareParam])], [ids, compareParam]);
  const key = wanted.join(",");
  const requestKey = `${key}#${attempt}`;

  useEffect(() => {
    if (!hydrated || !key) return;
    const ctrl = new AbortController();
    fetch(`/api/selection/?ids=${encodeURIComponent(key)}`, { signal: ctrl.signal, headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { records: SelectionRecord[] }) => setLoaded({ key: requestKey, state: "ready", records: d.records }))
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setLoaded((l) => ({ key: requestKey, state: "error", records: l?.records ?? [] }));
      });
    return () => ctrl.abort();
  }, [key, requestKey, hydrated]);

  const load: Load = !hydrated
    ? { state: "idle", records: [] }
    : !key
      ? { state: "ready", records: [] }
      : loaded?.key === requestKey
        ? { state: loaded.state, records: loaded.records }
        : { state: "loading", records: loaded?.records ?? [] };

  const byId = useMemo(() => new Map(load.records.map((r) => [r.id, r] as const)), [load.records]);
  const saved = ids.map((id) => byId.get(id)).filter((r): r is SelectionRecord => !!r);
  const compared = compareParam.map((id) => byId.get(id)).filter((r): r is SelectionRecord => !!r);

  const setCompare = useCallback(
    (next: string[]) => {
      const qs = next.length ? `?compare=${next.join(",")}` : "";
      router.replace(`/selection/${qs}`, { scroll: false });
    },
    [router],
  );
  const toggleCompare = (id: string) =>
    setCompare(compareParam.includes(id) ? compareParam.filter((x) => x !== id) : [...compareParam, id].slice(0, MAX_COMPARE));

  if (!hydrated || load.state === "idle" || (load.state === "loading" && load.records.length === 0)) {
    return (
      <p className="min-h-[30vh] text-muted-dark" role="status">
        Loading your selection…
      </p>
    );
  }

  if (load.state === "error" && load.records.length === 0) {
    return (
      <div className="border border-line-dark p-8" role="alert">
        <h2 className="display-md">Your selection could not be loaded.</h2>
        <p className="mt-4 text-muted-dark">The saved works are still kept in this browser. Please try again.</p>
        <button type="button" className="btn btn-ghost mt-6" onClick={() => setAttempt((n) => n + 1)}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      {compared.length > 0 && <Comparison records={compared} onRemove={(id) => setCompare(compareParam.filter((x) => x !== id))} />}

      <section aria-labelledby="saved-title" className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-dark pb-5">
          <h2 id="saved-title" className="display-md">
            Saved works <span className="numeral text-muted-dark">{saved.length}</span>
          </h2>
          {saved.length > 0 &&
            (confirmClear ? (
              <div className="flex flex-wrap items-center gap-3 text-sm" role="group" aria-label="Confirm clearing the selection">
                <span>Remove all {saved.length} works from this browser?</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    clearSelection();
                    setConfirmClear(false);
                    setCompare([]);
                  }}
                >
                  Yes, clear
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(false)} autoFocus>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" className="label inline-flex min-h-11 items-center text-muted-dark hover:text-on-dark" onClick={() => setConfirmClear(true)}>
                Clear selection
              </button>
            ))}
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-start gap-5">
            <p className="measure text-muted-dark">
              Your Private Selection is empty. On any object page, choose <span className="text-on-dark">Save to Private Selection</span> to set a
              work aside here. It stays in this browser only.
            </p>
            <Link href="/collection/" className="btn btn-primary">
              Explore the collection
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-dark" aria-live="polite">
              {compareParam.length >= MAX_COMPARE
                ? "Three works chosen for comparison, the most that fit side by side."
                : `Choose up to ${MAX_COMPARE} works to compare side by side.`}
            </p>
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {saved.map((r) => {
                const inCompare = compareParam.includes(r.id);
                return (
                  <li key={r.id} className="flex flex-col gap-3">
                    <Link href={`/collection/objects/${r.slug}/`} className="plate relative block aspect-[4/5] overflow-hidden">
                      <Image src={r.hero.src} alt="" fill sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 45vw, 100vw" className="object-contain p-4" />
                      <span className="sr-only">{r.title}</span>
                    </Link>
                    <p className="label text-muted-dark">{r.status.label}</p>
                    <h3 className="display-sm">
                      <Link href={`/collection/objects/${r.slug}/`} className="link-quiet no-underline hover:underline">
                        {r.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-dark">{[r.dating, r.attributionKnown ? r.attribution : null].filter(Boolean).join(" · ")}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={inCompare}
                        disabled={!inCompare && compareParam.length >= MAX_COMPARE}
                        onClick={() => toggleCompare(r.id)}
                        className={`btn btn-ghost btn-sm ${inCompare ? "border-accent" : ""}`}
                      >
                        {inCompare && (
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M2 6.5 5 9l5-6" />
                          </svg>
                        )}
                        Compare
                        <span className="sr-only"> {r.title}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          removeFromSelection(r.id);
                          if (inCompare) setCompare(compareParam.filter((x) => x !== r.id));
                        }}
                      >
                        Remove<span className="sr-only"> {r.title}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function Comparison({ records, onRemove }: { records: SelectionRecord[]; onRemove: (id: string) => void }) {
  const rows: Array<{ label: string; value: (r: SelectionRecord) => React.ReactNode }> = [
    { label: "Status", value: (r) => r.status.label },
    { label: "Attribution", value: (r) => r.attribution },
    { label: "Date", value: (r) => r.dating ?? "Not documented" },
    { label: "Object", value: (r) => r.objectType },
    { label: "Technique", value: (r) => (r.techniques.length ? r.techniques.join(", ") : "Not documented") },
    { label: "Materials", value: (r) => (r.materials.length ? r.materials.join(", ") : "Not documented") },
    { label: "Height", value: (r) => cmIn(r.dimensions.heightMm) },
    { label: "Width", value: (r) => cmIn(r.dimensions.widthMm) },
    { label: "Diameter", value: (r) => cmIn(r.dimensions.diameterMm) },
    { label: "Record", value: (r) => <span className="font-mono text-sm">{r.id}</span> },
  ];
  return (
    <section aria-labelledby="compare-title" className="flex flex-col gap-8">
      <h2 id="compare-title" className="display-md">
        Side by side
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Comparison of {records.length} works</caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 p-0">
                <span className="sr-only">Field</span>
              </th>
              {records.map((r) => (
                <th key={r.id} scope="col" className="px-4 pb-6 align-top font-normal">
                  <div className="plate relative mb-4 aspect-square">
                    <Image src={r.hero.src} alt={r.hero.alt} fill sizes="(min-width: 64rem) 25vw, 40vw" className="object-contain p-3" />
                  </div>
                  <Link href={`/collection/objects/${r.slug}/`} className="font-display text-xl text-on-dark">
                    {r.title}
                  </Link>
                  <button type="button" className="label mt-2 flex min-h-11 items-center text-muted-dark hover:text-on-dark" onClick={() => onRemove(r.id)}>
                    Remove from comparison<span className="sr-only"> : {r.title}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line-dark">
                <th scope="row" className="label py-3 pr-4 align-top font-medium text-muted-dark">
                  {row.label}
                </th>
                {records.map((r) => (
                  <td key={r.id} className="px-4 py-3 align-top text-on-dark">
                    {row.value(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScaleDiagram records={records} />
    </section>
  );
}

/**
 * Relative size from recorded measurements only: each work is an outline box
 * of its recorded height and width (or diameter), all drawn to one scale. It
 * compares size; it is not a picture of the objects and not a measuring tool.
 */
function ScaleDiagram({ records }: { records: SelectionRecord[] }) {
  const measured = records
    .map((r) => ({ r, h: r.dimensions.heightMm, w: r.dimensions.widthMm ?? r.dimensions.diameterMm ?? r.dimensions.depthMm }))
    .filter((x): x is { r: SelectionRecord; h: number; w: number | undefined } => typeof x.h === "number" && x.h > 0);
  const missing = records.filter((r) => !r.dimensions.heightMm);
  if (measured.length === 0)
    return <p className="text-sm text-muted-dark">A size comparison needs recorded heights. None of these works has one yet.</p>;

  const H = 220;
  const maxH = Math.max(...measured.map((m) => m.h));
  const scale = H / maxH;
  const gap = 48;
  const boxes = measured.map((m) => ({ ...m, bw: Math.max(6, (m.w ?? 0) * scale), bh: m.h * scale }));
  const width = boxes.reduce((s, b) => s + Math.max(b.bw, 120) + gap, gap);
  const ten = 100 * scale; // 10 cm
  const starts = boxes.map((_, i) => boxes.slice(0, i).reduce((s, b) => s + Math.max(b.bw, 120) + gap, gap));
  return (
    <figure className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label={`Relative size: ${boxes.map((b) => `${b.r.title}, ${one(b.h / 10)} cm high${b.w ? `, ${one(b.w / 10)} cm wide` : ""}`).join("; ")}.`}
          width={width + 60}
          height={H + 70}
          viewBox={`0 0 ${width + 60} ${H + 70}`}
          className="text-on-dark"
        >
          <line x1={0} x2={width + 60} y1={H + 10} y2={H + 10} stroke="currentColor" strokeOpacity="0.35" />
          {boxes.map((b, i) => {
            const slot = Math.max(b.bw, 120);
            const x = starts[i] ?? gap;
            const bx = x + (slot - b.bw) / 2;
            return (
              <g key={b.r.id}>
                {b.w ? (
                  <rect x={bx} y={H + 10 - b.bh} width={b.bw} height={b.bh} fill="none" stroke="currentColor" strokeWidth="1" />
                ) : (
                  <line x1={x + slot / 2} x2={x + slot / 2} y1={H + 10 - b.bh} y2={H + 10} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                )}
                <text x={x + slot / 2} y={H + 32} textAnchor="middle" fontSize="12" fill="currentColor">
                  {b.r.title.length > 22 ? `${b.r.title.slice(0, 21)}…` : b.r.title}
                </text>
                <text x={x + slot / 2} y={H + 50} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity="0.7">
                  {`H ${one(b.h / 10)} cm${b.w ? ` · W ${one(b.w / 10)} cm` : ""}`}
                </text>
              </g>
            );
          })}
          <g>
            <line x1={width + 30} x2={width + 30} y1={H + 10 - ten} y2={H + 10} stroke="currentColor" strokeWidth="2" />
            <text x={width + 24} y={H + 10 - ten / 2} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity="0.7">
              10 cm
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="text-caption text-muted-dark">
        Outline boxes drawn to one scale from the recorded height and width (or diameter). This compares size only: it is
        not a photograph and does not show the shapes. A dashed line means no width is recorded.
        {missing.length > 0 && ` Not shown, no recorded height: ${missing.map((r) => r.title).join(", ")}.`}
      </figcaption>
    </figure>
  );
}
