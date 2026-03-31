"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { paymentsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const MOMO_PROVIDERS = [
  {
    key: "mtn",
    label: "MTN Mobile Money",
    color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  },
  {
    key: "vodafone",
    label: "Vodafone Cash",
    color: "bg-red-500/20 border-red-500/40 text-red-300",
  },
  {
    key: "airteltigo",
    label: "AirtelTigo Money",
    color: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

function RedeemContent() {
  const { user, refreshUser } = useAuth();
  const [points, setPoints] = useState(500);
  const [momoNumber, setMomoNumber] = useState("");
  const [provider, setProvider] = useState("mtn");
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    paymentsApi
      .getRates()
      .then(setRates)
      .catch(() => {});
  }, []);

  const ghs = (points * 0.01).toFixed(2);
  const canRedeem = user && user.total_points >= points && points >= 500;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!momoNumber.trim()) {
      toast.error("Please enter your Mobile Money number");
      return;
    }

    setLoading(true);
    try {
      await paymentsApi.withdrawMomo({
        points,
        momo_number: momoNumber,
        momo_provider: provider,
      });
      toast.success(`GHS ${ghs} is on its way to ${momoNumber}! 💸`);
      await refreshUser();
      setPoints(500);
      setMomoNumber("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Redemption failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-24 md:pb-8">
      <AppNavbar />

      <div className="max-w-lg mx-auto px-4 md:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-700 text-white mb-1">
            Redeem Points
          </h1>
          <p className="text-white/40">
            Convert your points to GHS via Mobile Money
          </p>
        </div>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-[#38e07b]/15 to-transparent border border-[#38e07b]/25 rounded-2xl p-6">
          <p className="text-white/50 text-sm mb-1">Your balance</p>
          <p className="font-display text-4xl font-800 text-[#38e07b]">
            {user.total_points.toLocaleString()}
            <span className="text-lg font-400 text-white/40 ml-2">points</span>
          </p>
          <p className="text-white/30 text-sm mt-1">
            = GHS {(user.total_points * 0.01).toFixed(2)} available
          </p>
        </div>

        {/* Rate info */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-display text-lg font-700 text-white">100 pts</p>
            <p className="text-white/30 text-xs">= GHS 1</p>
          </div>
          <div>
            <p className="font-display text-lg font-700 text-white">500 pts</p>
            <p className="text-white/30 text-xs">minimum</p>
          </div>
          <div>
            <p className="font-display text-lg font-700 text-white">GHS 5</p>
            <p className="text-white/30 text-xs">minimum payout</p>
          </div>
        </div>

        <form onSubmit={handleRedeem} className="space-y-5">
          {/* Points amount */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Points to redeem
            </label>
            <input
              type="number"
              min={500}
              max={user.total_points}
              step={100}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 500)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#38e07b]/50 transition-colors text-lg font-display"
            />
            {/* Quick amounts */}
            <div className="flex gap-2 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPoints(amt)}
                  disabled={amt > user.total_points}
                  className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${
                    points === amt
                      ? "bg-[#38e07b]/20 border-[#38e07b]/50 text-[#38e07b]"
                      : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/60"
                  } disabled:opacity-20 disabled:cursor-not-allowed`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* GHS preview */}
          <div className="bg-[#38e07b]/8 border border-[#38e07b]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-sm">You&apos;ll receive</p>
              <p className="font-display text-3xl font-800 text-[#38e07b]">
                GHS {ghs}
              </p>
            </div>
            <span className="text-4xl">💸</span>
          </div>

          {/* MoMo Provider */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Network</label>
            <div className="grid grid-cols-3 gap-2">
              {MOMO_PROVIDERS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setProvider(p.key)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                    provider === p.key
                      ? p.color
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {p.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Mobile Money Number
            </label>
            <input
              type="tel"
              placeholder="0241234567"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
            <p className="text-white/20 text-xs mt-1">
              Format: 0241234567 or +233241234567
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !canRedeem}
            className="w-full bg-[#38e07b] text-[#0e1a13] font-display font-700 text-base py-4 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : !canRedeem && points > (user.total_points || 0)
                ? `Not enough points (need ${points - user.total_points} more)`
                : `Redeem ${points.toLocaleString()} pts for GHS ${ghs} →`}
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}

export default function RedeemPage() {
  return (
    <AuthGuard>
      <RedeemContent />
    </AuthGuard>
  );
}
