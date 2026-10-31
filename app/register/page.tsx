import { Check } from "lucide-react";
import { redirect } from "next/navigation";

import { RegisterFooter, RegisterForm } from "@/app/register/register-form";
import { AuthShell } from "@/components/auth-shell";
import { getUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Send your first quote free · QuotePace",
  description:
    "Create a free QuotePace account. No card. Your prices, and a link your customer accepts on their phone.",
  path: "/register",
});

/*
 * Sign in and register used to be one screen with a toggle, which meant the two
 * looked identical and nobody could tell which one they were on. They are
 * separate routes now, and this one carries the marigold card: the accent is
 * the fastest way to know at a glance that this is the "new here" page.
 */
const included = [
  "Free forever",
  "No card",
  "Set up in 2 minutes",
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getUser()) redirect("/dashboard");

  const { next } = await searchParams;
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

  return (
    <AuthShell
      title="Send your first quote free"
      tagline="Free forever. No card. Set up in 2 minutes."
      footer={<RegisterFooter />}
      aside={
        // DESIGN.md accent card: one full-bleed hue, no border, black text.
        <div className="rounded-lg bg-marigold p-6">
          <ul className="space-y-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 font-medium">
                <Check className="mt-0.5 size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <RegisterForm next={safeNext} />
    </AuthShell>
  );
}
