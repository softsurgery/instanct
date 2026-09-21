import { ShieldCheck } from "lucide-react";
import { safetyPoints } from "@/lib/site";

export function Safety() {
  return (
    <section id="safety" className="scroll-mt-24 border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="size-4" />
            Safety & trust
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Designed with trust at the core
          </h2>
          <p className="mt-3 text-muted-foreground">
            Clear policies, proactive moderation, and settings that keep you in
            control of what you share.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {safetyPoints.map((point) => (
            <article
              key={point.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <h3 className="font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
