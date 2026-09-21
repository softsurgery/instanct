import {
  Bookmark,
  Briefcase,
  CalendarClock,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@instanct/ui/components/card";
import { features } from "@/lib/site";

const icons = {
  map: MapPin,
  profile: UserRound,
  chat: MessageCircle,
  session: CalendarClock,
  request: Briefcase,
  bookmark: Bookmark,
};

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">What we offer</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Curated discovery with thoughtful experiences
          </h2>
          <p className="mt-3 text-muted-foreground">
            Instanct brings map-based discovery, professional profiles, live
            chat, and meeting tools together in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = icons[feature.icon];
            return (
              <Card key={feature.title} className="gap-4 py-5">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
