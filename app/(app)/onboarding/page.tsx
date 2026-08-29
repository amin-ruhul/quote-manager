import { BusinessProfileForm } from "@/app/(app)/onboarding/business-profile-form";
import { getBusinessForOwner, requireUser } from "@/lib/auth";

export const metadata = { title: "Business profile · QuotePilot" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const business = await getBusinessForOwner(user.id);
  const isNew = business === null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">
          {isNew ? "Set up your business" : "Business profile"}
        </h1>
        <p className="mt-2 text-body">
          {isNew
            ? "This is what your customers see on every quote. You can change it any time."
            : "Details that appear on the quotes you send."}
        </p>
      </header>

      <div className="rounded-lg border border-hairline bg-surface p-5 sm:p-6">
        <BusinessProfileForm business={business} />
      </div>

      {isNew ? (
        <p className="text-sm text-ink-60">
          We&apos;ll start your pricebook with common electrical jobs. Every
          price is yours to edit.
        </p>
      ) : null}
    </div>
  );
}
