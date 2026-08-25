export default async function TenantUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <h1 className="text-2xl font-semibold">This site is temporarily unavailable</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The owner needs to resolve a billing or account issue. Your data is safe and nothing has
        been deleted.
      </p>
    </div>
  );
}
