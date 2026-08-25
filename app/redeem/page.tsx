"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon, type IconName } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { paymentsApi, rewardsApi, type Reward } from "@/lib/api";
import { cn } from "@/lib/utils";

const MOMO_PROVIDERS = [
  { key: "mtn", label: "MTN" },
  { key: "vodafone", label: "Telecel" },
  { key: "airteltigo", label: "AirtelTigo" },
];

// 100 points = GHS 1. Overridden by /payments/rates when that call succeeds.
const DEFAULT_GHS_PER_POINT = 0.01;
const MIN_WITHDRAWAL_POINTS = 500;

function iconFor(reward: Reward): IconName {
  const t = `${reward.reward_type ?? ""} ${reward.name}`.toLowerCase();
  if (t.includes("airtime") || t.includes("data")) return "phone";
  if (t.includes("shirt") || t.includes("tee")) return "shirt";
  if (t.includes("cash") || t.includes("money")) return "money";
  if (t.includes("bag") || t.includes("tote")) return "bag";
  return "gift";
}

function WalletContent() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState<"catalog" | "cash">("catalog");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rate, setRate] = useState(DEFAULT_GHS_PER_POINT);
  const [points, setPoints] = useState(MIN_WITHDRAWAL_POINTS);
  const [momoNumber, setMomoNumber] = useState("");
  const [provider, setProvider] = useState("mtn");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    rewardsApi
      .list()
      .then(setRewards)
      .catch(() => setRewards([]));

    paymentsApi
      .getRates()
      .then((r) => {
        const perPoint = r?.ghs_per_point ?? r?.rate;
        if (typeof perPoint === "number" && perPoint > 0) setRate(perPoint);
      })
      .catch(() => undefined);
  }, []);

  if (!user) return null;

  const balance = user.total_points;
  const cashValue = (balance * rate).toFixed(2);
  const canWithdraw =
    balance >= points && points >= MIN_WITHDRAWAL_POINTS && momoNumber.length >= 9;

  const withdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await paymentsApi.withdrawMomo({
        points,
        momo_number: momoNumber,
        momo_provider: provider,
      });
      toast.success("Withdrawal requested. You'll get a MoMo prompt shortly.");
      await refreshUser();
      router.refresh();
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Withdrawal failed.";
      toast.error(detail);
    } finally {
      setBusy(false);
    }
  };

  const redeem = async (reward: Reward) => {
    setBusy(true);
    try {
      await rewardsApi.redeem(reward.id);
      toast.success(`Redeemed ${reward.name}.`);
      await refreshUser();
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Could not redeem that reward.";
      toast.error(detail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4.5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-9.5 place-items-center rounded-full border border-border bg-surface text-ink lg:hidden"
        >
          <Icon name="back" size={18} />
        </button>
        <h1 className="font-display text-[22px] font-bold text-ink">Rewards</h1>
      </header>

      <section className="flex flex-col gap-4 rounded-xl bg-ink-surface p-4.5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/55">
              Available balance
            </p>
            <p className="flex items-baseline gap-1.5">
              <span className="numeric text-[32px] font-bold leading-none text-white">
                {balance.toLocaleString()}
              </span>
              <span className="text-[13px] text-white/55">pts</span>
            </p>
            <p className="text-xs text-primary">
              ≈ GHS {cashValue} at {Math.round(1 / rate)} pts / GHS 1
            </p>
          </div>
          <span className="grid size-11 place-items-center rounded-full bg-white/10">
            <Icon name="wallet" size={20} className="text-primary" />
          </span>
        </div>

        <div className="flex gap-2">
          {(
            [
              { key: "catalog", label: "Catalog", icon: "gift" },
              { key: "cash", label: "Cash out", icon: "phone" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors",
                tab === t.key
                  ? "bg-primary text-on-primary"
                  : "bg-white/8 text-white",
              )}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "catalog" ? (
        rewards.length ? (
          <div className="space-y-3">
            {rewards.map((reward) => {
              const affordable =
                reward.is_available && balance >= reward.cost_in_points;
              return (
                <div
                  key={reward.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5",
                    !reward.is_available && "opacity-60",
                  )}
                >
                  <span className="grid size-11.5 shrink-0 place-items-center rounded-md bg-surface-2">
                    <Icon name={iconFor(reward)} size={20} className="text-ink" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{reward.name}</p>
                    {reward.description && (
                      <p className="truncate text-[11px] text-ink-muted">
                        {reward.description}
                      </p>
                    )}
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-primary-ink">
                      <Icon name="zap" size={12} />
                      {reward.cost_in_points.toLocaleString()} pts
                    </p>
                  </div>
                  <button
                    onClick={() => redeem(reward)}
                    disabled={!affordable || busy}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-2.5 text-xs font-semibold transition-opacity",
                      affordable
                        ? "bg-primary text-on-primary hover:opacity-90"
                        : "bg-surface-2 text-ink-muted",
                    )}
                  >
                    {!reward.is_available
                      ? "Sold out"
                      : affordable
                        ? "Redeem"
                        : "Not enough"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-14 text-center">
            <Icon name="gift" size={26} className="text-ink-muted" />
            <p className="text-sm text-ink-muted">
              No rewards available right now.
            </p>
          </div>
        )
      ) : (
        <form onSubmit={withdraw} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              PROVIDER
            </legend>
            <div className="flex gap-2">
              {MOMO_PROVIDERS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={provider === p.key}
                  onClick={() => setProvider(p.key)}
                  className={cn(
                    "flex-1 rounded-md border py-2.5 text-xs font-semibold transition-colors",
                    provider === p.key
                      ? "border-primary bg-primary-soft text-primary-ink"
                      : "border-border bg-surface text-ink-muted",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              MOMO NUMBER
            </span>
            <input
              inputMode="tel"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              placeholder="024 123 4567"
              className="rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              POINTS TO CASH OUT
              <span className="text-primary-ink">
                = GHS {(points * rate).toFixed(2)}
              </span>
            </span>
            <input
              type="number"
              min={MIN_WITHDRAWAL_POINTS}
              max={balance}
              step={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm text-ink outline-none"
            />
          </label>

          <p className="flex items-start gap-2.5 rounded-md bg-surface-2 p-3 text-xs leading-relaxed text-ink-muted">
            <Icon name="info" size={15} className="mt-px shrink-0" />
            Minimum {MIN_WITHDRAWAL_POINTS.toLocaleString()} points per
            withdrawal. Payouts are processed through Paystack.
          </p>

          <button
            type="submit"
            disabled={!canWithdraw || busy}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="phone" size={17} />
            {busy ? "Requesting…" : "Withdraw to MoMo"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RedeemPage() {
  return (
    <AuthGuard>
      <AppShell>
        <WalletContent />
      </AppShell>
    </AuthGuard>
  );
}
