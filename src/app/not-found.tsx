import Link from "next/link";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="container-gallery flex flex-col items-start gap-6 py-24 lg:py-36">
      <p className="label text-accent">404</p>
      <h1 className="display-xl max-w-3xl">This page is not in the collection.</h1>
      <p className="max-w-prose text-muted-dark">
        The address may have changed while the collection is being reorganised. Try the collection or the Glass Guide.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href={routes.collection()} className="btn btn-primary">
          Browse the collection
        </Link>
        <Link href={routes.guide()} className="btn btn-ghost">
          Glass Guide
        </Link>
      </div>
    </div>
  );
}
