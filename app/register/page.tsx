import { Check } from "lucide-react";
import { redirect } from "next/navigation";

import { RegisterFooter, RegisterForm } from "@/app/register/register-form";
import { AuthShell } from "@/components/auth-shell";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Create your account · QuotePace" };

/*
 * Sign in and register used to be one screen with a toggle, which meant the two
 * looked identical and nobody could tell which one they were on. They are
 * separate routes now, and this one carries the marigold card: the accent is
 * the fastest way to know at a glance that this is the "new here" page.
 */
/*
 * No quote count: "free" is the promise, and a number next to it reads as the
 * catch. It is not "unlimited" either — lib/quota.ts still caps the month.
 *
 * The pricebook line used to say it came "set up for electricians". It doesn't
 * any more: onboarding stopped copying a default pricebook in, because those
 * were our prices and not the owner's.
 */
const included = [
  "Free to start — no card",
  "Your own prices, reused on every quote",
  "Sent, viewed, and accepted — tracked",
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
      title="Create your account"
      tagline="Two minutes, and your first quote is ready to send."
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
