import Link from "next/link";
import { Button } from "@instanct/ui/components/button";
import { ProductPreview } from "@/components/product-preview";
import { StoreBadges } from "@/components/store-badges";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:py-20 lg:py-24">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            The next generation of connectivity
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
            {site.description} Explore, message, and meet people nearby with a
            modern experience designed for trust.
          </p>
          <StoreBadges />
          <Button variant="link" className="h-auto px-0" asChild>
            <Link href="/#features">See how it works</Link>
          </Button>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
