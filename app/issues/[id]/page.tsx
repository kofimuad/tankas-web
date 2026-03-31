"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { BadgeTier } from "@/components/badge-tier";
import { issuesApi, pledgesApi, volunteersApi, Issue, Pledge } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const difficultyColor = {
  easy: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

const priorityColor = {
  low: "bg-blue-500/15 text-blue-400",
  medium: "bg-orange-500/15 text-orange-400",
  high: "bg-red-500/15 text-red-400",
};

function PledgeModal({
  issueId,
  onClose,
  onSuccess,
}: {
  issueId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState("money");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pledgesApi.create(issueId, {
        pledge_type: type,
        description,
        quantity: parseInt(quantity),
        amount: type === "money" ? parseFloat(amount) : undefined,
      });
      toast.success("Pledge created! Thank you for your support 🙌");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create pledge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
      <div className="bg-[#0e1a13] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-700 text-white">
            Make a Pledge
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {["money", "equipment", "volunteer", "other"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                  type === t
                    ? "bg-[#38e07b] border-[#38e07b] text-[#0e1a13] font-600"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {t === "money"
                  ? "💰 Money"
                  : t === "equipment"
                    ? "🛠️ Equipment"
                    : t === "volunteer"
                      ? "🙋 Volunteer"
                      : "💡 Other"}
              </button>
            ))}
          </div>

          {type === "money" && (
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Amount (GHS)
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="20"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50"
              />
            </div>
          )}

          {type === "equipment" && (
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#38e07b]/50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Description
            </label>
            <input
              type="text"
              required
              placeholder={
                type === "money"
                  ? "GHS 20 donation"
                  : type === "equipment"
                    ? "10 trash bags"
                    : type === "volunteer"
                      ? "I'll bring my truck on Saturday"
                      : "What are you pledging?"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38e07b] text-[#0e1a13] font-display font-700 py-3 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Pledge"}
          </button>
        </form>
      </div>
    </div>
  );
}

function IssueDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [pledgeData, setPledgeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [volunteering, setVolunteering] = useState(false);
  const [showPledgeModal, setShowPledgeModal] = useState(false);

  const loadData = async () => {
    try {
      const [issueData, pledges] = await Promise.all([
        issuesApi.getById(issueId),
        pledgesApi.getByIssue(issueId),
      ]);
      setIssue(issueData);
      setPledgeData(pledges);
    } catch {
      toast.error("Failed to load issue");
      router.push("/issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [issueId]);

  const handleVolunteer = async () => {
    setVolunteering(true);
    try {
      await volunteersApi.join(issueId);
      toast.success("You've joined the cleanup group! 🧹");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to join");
    } finally {
      setVolunteering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1a13] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#38e07b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-32 md:pb-8">
      <AppNavbar />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>

        {/* Hero image */}
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
          <img
            src={issue.picture_url}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyColor[issue.difficulty]}`}
            >
              {issue.difficulty}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor[issue.priority]}`}
            >
              {issue.priority} priority
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#38e07b]/20 text-[#38e07b] border border-[#38e07b]/30 font-600">
              +{issue.points_assigned} pts
            </span>
          </div>
        </div>

        {/* Title + status */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-snug">
              {issue.title}
            </h1>
            <span
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium mt-1 ${
                issue.status === "open"
                  ? "bg-[#38e07b]/15 text-[#38e07b]"
                  : issue.status === "resolved"
                    ? "bg-slate-500/15 text-slate-400"
                    : "bg-yellow-500/15 text-yellow-400"
              }`}
            >
              {issue.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-white/50 leading-relaxed">{issue.description}</p>
          <p className="text-white/20 text-sm mt-3">
            📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)} ·{" "}
            {new Date(issue.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* AI labels */}
        {issue.ai_labels && issue.ai_labels.length > 0 && (
          <div>
            <p className="text-white/30 text-xs mb-2 uppercase tracking-widest">
              AI Detected
            </p>
            <div className="flex flex-wrap gap-2">
              {issue.ai_labels.map((label) => (
                <span
                  key={label}
                  className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pledges summary */}
        {pledgeData && (
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-700 text-white">
                Pledges
              </h2>
              {issue.status === "open" && (
                <button
                  onClick={() => setShowPledgeModal(true)}
                  className="text-sm bg-[#38e07b]/15 border border-[#38e07b]/30 text-[#38e07b] px-4 py-1.5 rounded-full hover:bg-[#38e07b]/25 transition-colors"
                >
                  + Pledge
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="font-display text-2xl font-700 text-[#38e07b]">
                  GHS {pledgeData.total_money_ghs}
                </p>
                <p className="text-white/30 text-xs">Money pledged</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-700 text-white">
                  {pledgeData.summary?.equipment || 0}
                </p>
                <p className="text-white/30 text-xs">Equipment</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-700 text-white">
                  {pledgeData.total_pledges}
                </p>
                <p className="text-white/30 text-xs">Total pledges</p>
              </div>
            </div>

            {pledgeData.pledges?.length > 0 && (
              <div className="space-y-2 border-t border-white/8 pt-4">
                {pledgeData.pledges
                  .slice(0, 5)
                  .map((pledge: Pledge & { pledger_name: string }) => (
                    <div
                      key={pledge.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {pledge.pledge_type === "money"
                            ? "💰"
                            : pledge.pledge_type === "equipment"
                              ? "🛠️"
                              : pledge.pledge_type === "volunteer"
                                ? "🙋"
                                : "💡"}
                        </span>
                        <div>
                          <p className="text-white/70 text-sm">
                            {pledge.description}
                          </p>
                          <p className="text-white/30 text-xs">
                            {pledge.pledger_name}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          pledge.status === "fulfilled"
                            ? "bg-green-500/15 text-green-400"
                            : "bg-white/8 text-white/40"
                        }`}
                      >
                        {pledge.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      {issue.status === "open" && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0e1a13]/95 backdrop-blur-md border-t border-white/8 p-4 flex gap-3 md:relative md:bg-transparent md:border-0 md:max-w-3xl md:mx-auto md:px-6 md:pt-0">
          <button
            onClick={handleVolunteer}
            disabled={volunteering}
            className="flex-1 bg-[#38e07b] text-[#0e1a13] font-display font-700 py-4 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-50 text-base"
          >
            {volunteering ? "Joining..." : "🙋 Volunteer"}
          </button>
          <button
            onClick={() => setShowPledgeModal(true)}
            className="flex-1 bg-white/8 border border-white/15 text-white font-display font-600 py-4 rounded-xl hover:bg-white/12 transition-all text-base"
          >
            💰 Pledge
          </button>
        </div>
      )}

      {showPledgeModal && (
        <PledgeModal
          issueId={issueId}
          onClose={() => setShowPledgeModal(false)}
          onSuccess={loadData}
        />
      )}

      <BottomNav />
    </div>
  );
}

export default function IssueDetailPage() {
  return (
    <AuthGuard>
      <IssueDetailContent />
    </AuthGuard>
  );
}
