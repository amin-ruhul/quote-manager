import { PushToggle } from "@/components/pwa/push-toggle";
import { BusinessProfileForm } from "@/app/(app)/onboarding/business-profile-form";
import { getBusinessForOwner, requireUser } from "@/lib/auth";

export const metadata = { title: "Business profile · QuotePace" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const business = await getBusinessForOwner(user.id);
  const isNew = business === null;

  return (
    // Full shell width: the form is two columns from lg, and capping it at 3xl
    // left the preview cramped with empty canvas either side of it.
    <div className="space-y-6">
      {/* The prose stays narrow even though the page is wide — a heading and a
          standfirst set to 1100px are hard to read, whatever the container. */}
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold">
          {isNew ? "Set up your business" : "Business profile"}
        </h1>
        <p className="mt-2 text-body">
          {isNew
            ? "This is what your customers see on every quote. You can change it any time."
            : "Your details, how customers reach you, and the defaults every new quote starts from."}
        </p>
      </header>

      {/* The form owns its own panels — it is three groups, not one card. */}
      <BusinessProfileForm business={business} />

      {/*
        Only once they're set up: the first run is about getting a business
        saved, not about notification settings.
      */}
      {isNew ? (
        <p className="max-w-2xl text-sm text-ink-60">
          We&apos;ll start your pricebook with common electrical jobs. Every
          price is yours to edit.
        </p>
      ) : (
        <PushToggle />
      )}
    </div>
  );
}
