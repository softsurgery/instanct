import { Check } from "lucide-react";
import { Badge } from "@instanct/ui/components/badge";

const highlights = [
  "Filter by industry and objectives",
  "Share when you are available to connect",
  "Chat, poke, and bookmark in one flow",
  "English, French, and Arabic",
];

export function ProductShowcase() {
  return (
    <section className="border-t">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-medium text-primary">Our mission</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Tools that help people connect with confidence
          </h2>
          <p className="text-muted-foreground">
            We build for meaningful connections based on shared interests, local
            discovery that stays human-first, and experiences that prioritize
            safety, trust, and inclusion.
          </p>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ShowcaseCard
            title="Explore"
            body="See who is around you, then open a profile to learn about their experience, education, and intent."
            badge="Map"
          />
          <ShowcaseCard
            title="Sessions"
            body="Tell the community you are ready to connect. Others nearby can reach out while you are available."
            badge="Live"
          />
          <ShowcaseCard
            title="Requests"
            body="Propose a meeting with a message, time, and place. Accepted requests are added to your schedule."
            badge="Meet"
          />
          <ShowcaseCard
            title="Chat"
            body="Keep the conversation going with real-time messaging, media, and lightweight pokes."
            badge="Realtime"
          />
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  title,
  body,
  badge,
}: {
  title: string;
  body: string;
  badge: string;
}) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <Badge variant="secondary">{badge}</Badge>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}
