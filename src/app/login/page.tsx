import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { PlatformLogo } from "@/components/site/platform-logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex flex-col items-center gap-8">
        <PlatformLogo />
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
