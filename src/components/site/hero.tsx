import Image from "next/image";
import { SiteLink } from "@/components/site/site-base-path";

export function Hero({
  kennelName,
  tagline,
  heroImageUrl,
  availableCount,
}: {
  kennelName: string;
  tagline?: string | null;
  heroImageUrl?: string | null;
  availableCount: number;
}) {
  return (
    <section className="relative">
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[74vh]">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={kennelName}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="site-accent-bg h-full w-full opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        <div className="absolute inset-0 flex flex-col items-start justify-end px-5 pb-14 sm:px-10 sm:pb-20">
          <div className="mx-auto w-full max-w-6xl">
            <h1 className="site-font-heading max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
              {kennelName}
            </h1>
            {tagline && (
              <p className="mt-4 max-w-xl text-lg text-white/90 sm:text-xl">{tagline}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <SiteLink
                href="/available"
                className="site-accent-bg rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                Reserve now
              </SiteLink>
              <SiteLink
                href="/contact"
                className="rounded-full border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Get in Touch
              </SiteLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
