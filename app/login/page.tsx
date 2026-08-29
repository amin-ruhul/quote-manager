import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { Panel } from "@/components/panel";
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
  const safeNext = next?.startsWith("/") ? next : "/pricebook";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-semibold">QuotePilot</h1>
      <p className="mt-2 text-body">
        Sign in to set up your business and pricebook.
      </p>

      <Panel className="mt-8">
        <LoginForm next={safeNext} />
      </Panel>
    </main>
  );
}
