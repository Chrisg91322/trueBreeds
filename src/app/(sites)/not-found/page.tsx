import Link from "next/link";

export default function TenantNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <h1 className="text-2xl font-semibold">No site found here</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We couldn&apos;t find a breeder site at this address. If you&apos;re the owner, make sure
        your site is published in the dashboard.
      </p>
      <Link
        href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
        className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        Go to TrueBreeds
      </Link>
    </div>
  );
}
