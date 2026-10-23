import Image from "next/image";
import { SiteLink } from "@/components/site/site-base-path";

export function Hero({
  kennelName,
  tagline,
  heroImageUrl,
  logoUrl,
}: {
  kennelName: string;
  tagline?: string | null;
  heroImageUrl?: string | null;
  logoUrl?: string | null;
  availableCount: number;
}) {
  return (
    <section className="relative">
      {heroImageUrl ? (
        <div className="mx-auto w-full px-5 pt-6 sm:px-8 sm:pt-8 lg:w-[80%] lg:px-0">
          <Image
            src={heroImageUrl}
            alt={kennelName}
            width={1600}
            height={1146}
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="mx-auto h-auto w-full object-contain object-center"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ) : (
        <div className="relative h-[52vh] min-h-[360px] w-full overflow-hidden">
          <div className="site-accent-bg h-full w-full opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
        </div>
      )}

      <div
        className={
          heroImageUrl
            ? "mx-auto w-full max-w-6xl px-5 py-8 text-center sm:px-8 sm:py-10"
            : "absolute inset-0 flex flex-col items-start justify-end px-5 pb-14 sm:px-10 sm:pb-20"
        }
      >
        <div className={heroImageUrl ? "mx-auto w-full max-w-2xl" : "mx-auto w-full max-w-6xl"}>
          {!heroImageUrl && logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={96}
              height={96}
              priority
              unoptimized={/\.ico($|\?)/i.test(logoUrl)}
              className="mb-5 h-20 w-20 rounded-2xl object-cover ring-2 ring-white/80"
            />
          ) : null}
          <h1
            className={
              heroImageUrl
                ? "site-font-heading text-4xl font-semibold leading-tight sm:text-5xl"
                : "site-font-heading max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-6xl"
            }
          >
            {kennelName}
          </h1>
          {tagline && (
            <p
              className={
                heroImageUrl
                  ? "site-muted mx-auto mt-3 max-w-xl text-lg sm:text-xl"
                  : "mt-4 max-w-xl text-lg text-white/90 sm:text-xl"
              }
            >
              {tagline}
            </p>
          )}
          <div className={heroImageUrl ? "mt-6 flex flex-wrap justify-center gap-3" : "mt-8 flex flex-wrap gap-3"}>
            <SiteLink
              href="/available"
              className="site-accent-bg rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Reserve now
            </SiteLink>
            <SiteLink
              href="/contact"
              className={
                heroImageUrl
                  ? "rounded-full border site-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                  : "rounded-full border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              }
            >
              Get in Touch
            </SiteLink>
          </div>
        </div>
      </div>
    </section>
  );
}
