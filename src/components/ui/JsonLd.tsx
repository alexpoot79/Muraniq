const LT = new RegExp("<", "g");
const SEPARATORS = new RegExp("[\\u2028\\u2029]", "g");

/** Safe JSON-LD serialisation: escapes `<` so content can never close the script. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(LT, "\\u003c").replace(SEPARATORS, "");
}

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
