import Link from "next/link";
import { PlatformLogo } from "@/components/site/platform-logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <PlatformLogo size="sm" className="min-w-0" />
        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
