import Link from "next/link";
import { LogoImage } from "@/components/layout/Logo";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="container-gallery flex flex-col items-center gap-8 py-28 text-center lg:py-40">
      <LogoImage variant="monogram" height={48} className="h-12 w-auto" />
      <p className="label eyebrow text-muted-dark">404</p>
      <h1 className="display-xl max-w-4xl">
        This page is not <span className="serif-italic text-accent">in the collection.</span>
      </h1>
      <p className="max-w-prose text-muted-dark">
        The address may have changed while the collection is being reorganised. Try the collection or the Glass Guide.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
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
