import Link from "next/link";
import { differenceInDays } from "date-fns";

export function TrialBanner({
  trialEndsAt,
  planTier,
}: {
  trialEndsAt: Date | null;
  planTier: string;
}) {
  if (!trialEndsAt) return null;

  const daysLeft = differenceInDays(trialEndsAt, new Date());
  if (daysLeft < 0) {
    return (
      <div className="mx-8 mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Your trial has ended.{" "}
        <Link href="/settings/billing" className="font-medium underline">
          Upgrade your plan
        </Link>{" "}
        to keep sending messages.
      </div>
    );
  }

  if (daysLeft > 7) return null;

  return (
    <div className="mx-8 mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      {daysLeft === 0
        ? "Your trial ends today."
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left on your ${planTier} trial.`}{" "}
      <Link href="/settings/billing" className="font-medium underline">
        Choose a plan
      </Link>
    </div>
  );
}
