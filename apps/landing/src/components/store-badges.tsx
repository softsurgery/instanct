import Image from "next/image";
import { cn } from "@instanct/lib";
import { site } from "@/lib/site";

type StoreBadgesProps = {
  className?: string;
  badgeClassName?: string;
};

export function StoreBadges({ className, badgeClassName }: StoreBadgesProps) {
  const appleHref = site.urls.appStore || "/#get-started";
  const googleHref = site.urls.playStore || "/#get-started";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={appleHref}
        aria-label="Download on the App Store"
        className="transition-opacity hover:opacity-90"
      >
        <Image
          src="/get-apple.png"
          alt="Download on the App Store"
          width={1912}
          height={651}
          className={cn("h-11 w-auto", badgeClassName)}
        />
      </a>
      <a
        href={googleHref}
        aria-label="Get it on Google Play"
        className="transition-opacity hover:opacity-90"
      >
        <Image
          src="/get-google.png"
          alt="Get it on Google Play"
          width={1918}
          height={651}
          className={cn("h-11 w-auto", badgeClassName)}
        />
      </a>
    </div>
  );
}
