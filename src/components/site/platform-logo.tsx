import Image from "next/image";
import Link from "next/link";
import { PLATFORM_LOGO_SRC } from "@/lib/platform-branding";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  /** Compact mark for headers, sidebar, and tight chrome. */
  sm: "h-9 w-9 sm:h-10 sm:w-10",
  /** Auth / onboarding — large enough to brand, scales down on phones. */
  md: "h-16 w-16 sm:h-20 sm:w-20",
  /** Standalone brand moments. */
  lg: "h-20 w-20 sm:h-28 sm:w-28",
} as const;

const SIZE_PX = {
  sm: 40,
  md: 80,
  lg: 112,
} as const;

const WORDMARK_CLASS = {
  sm: "text-base sm:text-lg",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
} as const;

export function PlatformLogo({
  className,
  href = "/",
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  size?: keyof typeof SIZE_CLASS;
  showWordmark?: boolean;
}) {
  const px = SIZE_PX[size];

  return (
    <Link
      href={href}
      className={cn("inline-flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5", className)}
    >
      {PLATFORM_LOGO_SRC ? (
        <Image
          src={PLATFORM_LOGO_SRC}
          alt=""
          width={px}
          height={px}
          priority
          className={cn("shrink-0 object-contain", SIZE_CLASS[size])}
        />
      ) : null}
      {showWordmark ? (
        <span
          className={cn(
            "font-heading truncate font-semibold tracking-tight",
            WORDMARK_CLASS[size]
          )}
        >
          <span className="text-primary">true</span>
          <span className="text-brand-sage">Breeds</span>
        </span>
      ) : null}
    </Link>
  );
}
