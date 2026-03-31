"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { issuesApi } from "@/lib/api";
import { toast } from "sonner";

function ReportContent() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "detecting" | "found" | "manual"
  >("idle");
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);

  const handlePhoto = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Max 10MB.");
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // Try geolocation
    setGpsStatus("detecting");
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
        setGpsStatus("found");
      },
      () => setGpsStatus("manual"),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      toast.error("Please upload a photo");
      return;
    }
    if (!coords.lat || !coords.lng) {
      toast.error("Please provide a location");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", photo);
      fd.append("latitude", coords.lat);
      fd.append("longitude", coords.lng);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("priority", form.priority);

      await issuesApi.create(fd);
      toast.success("Issue reported! You earned 15 points 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-24 md:pb-8">
      <AppNavbar />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-700 text-white mb-1">
            Report an Issue
          </h1>
          <p className="text-white/40">
            Snap a photo, earn 15 points instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo upload */}
          <div>
            {!preview ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-56 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/30 hover:border-[#38e07b]/40 hover:text-white/50 hover:bg-white/3 transition-all"
              >
                <span className="text-5xl">📸</span>
                <p className="text-sm font-medium">Take or upload a photo</p>
                <p className="text-xs">
                  Max 10MB · GPS extracted automatically
                </p>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden h-56">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPreview(null);
                    setGpsStatus("idle");
                  }}
                  className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  ✕
                </button>
                {/* GPS status */}
                <div className="absolute bottom-3 left-3">
                  {gpsStatus === "detecting" && (
                    <span className="text-xs bg-yellow-500/80 text-yellow-900 px-3 py-1 rounded-full">
                      📍 Getting location...
                    </span>
                  )}
                  {gpsStatus === "found" && (
                    <span className="text-xs bg-[#38e07b]/80 text-[#0e1a13] px-3 py-1 rounded-full font-600">
                      ✓ Location captured
                    </span>
                  )}
                  {gpsStatus === "manual" && (
                    <span className="text-xs bg-red-500/80 text-white px-3 py-1 rounded-full">
                      ⚠️ Enter location manually
                    </span>
                  )}
                </div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handlePhoto(e.target.files[0])
              }
            />
          </div>

          {/* Manual location */}
          {gpsStatus === "manual" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="5.6037"
                  value={coords.lat}
                  onChange={(e) =>
                    setCoords({ ...coords, lat: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="-0.1870"
                  value={coords.lng}
                  onChange={(e) =>
                    setCoords({ ...coords, lng: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Title</label>
            <input
              type="text"
              placeholder="e.g. Overflowing bin near school"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
            <p className="text-white/20 text-xs mt-1">
              Optional — AI will generate one from the photo
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue in more detail..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.priority === p
                      ? p === "low"
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                        : p === "medium"
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-red-500/20 border-red-500/50 text-red-300"
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Points preview */}
          <div className="bg-[#38e07b]/8 border border-[#38e07b]/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">You&apos;ll earn</p>
              <p className="font-display text-2xl font-700 text-[#38e07b]">
                +15 points
              </p>
            </div>
            <span className="text-3xl">⭐</span>
          </div>

          <button
            type="submit"
            disabled={loading || !photo}
            className="w-full bg-[#38e07b] text-[#0e1a13] font-display font-700 text-base py-4 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report →"}
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <ReportContent />
    </AuthGuard>
  );
}
