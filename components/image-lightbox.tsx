"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Full-screen photo viewer.
 *
 * Moderation is a judgement call made from a thumbnail, so the photo has to be
 * inspectable: fit-to-screen by default, click (or the button) to zoom to 1:1
 * and pan by scrolling.
 */
export function ImageLightbox({
  src,
  alt = "",
  caption,
  onClose,
}: {
  src: string;
  alt?: string;
  caption?: string;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setZoomed((z) => !z);
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    // Stop the page behind scrolling while the overlay is up.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [handleKey]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Photo"}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-3 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
          {caption ?? alt}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-pressed={zoomed}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/25"
          >
            <Icon name={zoomed ? "minus" : "plus"} size={14} />
            {zoomed ? "Fit" : "Zoom"}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open the original in a new tab"
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <Icon name="forward" size={16} />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 items-center justify-center p-4 pt-0",
          zoomed && "overflow-auto",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {zoomed ? (
          // Native <img> here on purpose: at 1:1 the intrinsic size is the
          // point, and next/image would fight it with its own sizing.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onClick={() => setZoomed(false)}
            className="max-w-none cursor-zoom-out"
          />
        ) : (
          <div className="relative size-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="cursor-zoom-in object-contain"
              onClick={() => setZoomed(true)}
              priority
            />
          </div>
        )}
      </div>

      <p className="shrink-0 pb-4 text-center text-[11px] text-white/50">
        Click the photo to {zoomed ? "fit" : "zoom"} · Esc to close
      </p>
    </div>
  );
}
