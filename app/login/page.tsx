import { redirect } from "next/navigation";

import { LoginFooter, LoginForm } from "@/app/login/login-form";
import { AuthShell } from "@/components/auth-shell";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Sign in · QuotePilot" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getUser()) redirect("/dashboard");

  const { next } = await searchParams;
  // Only same-site paths, so a crafted ?next= can't bounce the owner off-site.
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/pricebook";

  return (
    <AuthShell
      title="Sign in"
      tagline="Welcome back. Pick up where you left off."
      footer={<LoginFooter />}
    >
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
