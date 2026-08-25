import { SettingsNav } from "@/components/dashboard/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your kennel profile, theme, payments, and team.
        </p>
      </div>
      <SettingsNav />
      <div>{children}</div>
    </div>
  );
}
