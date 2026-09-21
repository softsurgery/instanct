import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={28} height={28} className="size-7" />
            <span className="font-semibold">{site.name}</span>
          </Link>
          <p className="text-sm text-muted-foreground">{site.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-medium">Product</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#safety" className="hover:text-foreground">
                  Safety
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Legal</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Contact</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href={`mailto:${site.urls.contact}`}
                  className="hover:text-foreground"
                >
                  {site.urls.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © 2026 {site.name}. Built for people who want to connect with
          confidence.
        </p>
      </div>
    </footer>
  );
}
