import Link from "next/link";
import { z } from "zod";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Email confirmation · QuotePilot" };

const searchSchema = z.object({
  status: z.enum(["success", "expired", "error"]).catch("error"),
  next: z.string().startsWith("/").catch("/onboarding"),
});

/** DESIGN.md status pill — same colour pairs as the quote lifecycle. */
function StatusPill({
  tone,
  label,
}: {
  tone: "accepted" | "declined";
  label: string;
}) {
  const classes =
    tone === "accepted"
      ? "bg-status-accepted-bg text-status-accepted"
      : "bg-status-declined-bg text-status-declined";

  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-1 text-sm font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; next?: string }>;
}) {
  const raw = await searchParams;
  const { status, next } = searchSchema.parse({
    status: raw.status,
    next: raw.next,
  });

  // A used link and an expired link are indistinguishable — the token is
  // single-use either way. A live session tells us it was simply already done.
  const user = await getUser();
  const alreadyConfirmed = status !== "success" && user !== null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-semibold">QuotePilot</h1>

      <Panel className="mt-8 space-y-4">
        {status === "success" ? (
          <>
            <StatusPill tone="accepted" label="Email confirmed" />
            <h2 className="text-xl font-semibold">You&apos;re all set</h2>
            <p className="text-body">
              Your email is confirmed. Next: set up your business so it appears
              on every quote you send.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href={next}>Set up your business</Link>
            </Button>
          </>
        ) : alreadyConfirmed ? (
          <>
            <StatusPill tone="accepted" label="Already confirmed" />
            <h2 className="text-xl font-semibold">Nothing left to do</h2>
            <p className="text-body">
              This link was already used. You&apos;re signed in, so you can
              carry straight on.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/onboarding">Continue</Link>
            </Button>
          </>
        ) : (
          <>
            <StatusPill tone="declined" label="Link not valid" />
            <h2 className="text-xl font-semibold">This link has expired</h2>
            <p className="text-body">
              Confirmation links work once and then expire. If you already
              confirmed this address, sign in as normal — otherwise sign up
              again to get a fresh link.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </>
        )}
      </Panel>
    </main>
  );
}
