import { redirect } from "next/navigation";

import { LoginFooter, LoginForm } from "@/app/login/login-form";
import { AuthShell } from "@/components/auth-shell";
import { getUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign in · QuotePace",
  description:
    "Sign in to QuotePace and pick up the quote you were writing.",
  path: "/login",
  // Reachable from every page, but never a search result worth landing on.
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getUser()) redirect("/dashboard");

  const { next } = await searchParams;
  // Only same-site paths, so a crafted ?next= can't bounce the owner off-site.
  // With nowhere in particular to go, the dashboard is home; an owner with no
  // business profile is moved on to /onboarding by requireBusiness().
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

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
