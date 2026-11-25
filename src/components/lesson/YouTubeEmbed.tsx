"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { Video } from "@/content/schema";
import { vi } from "@/i18n/vi";

/**
 * Click-to-load YouTube facade (research R12): shows a thumbnail and only loads the
 * privacy-enhanced iframe after the user clicks. Source credit is always visible (FR-008b).
 */
export function YouTubeEmbed({ video, title }: { video: Video; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="my-6">
      <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
        {loaded ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`${vi.video.play}: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external thumbnail, no optimisation needed */}
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-black/70 text-white transition group-hover:scale-105">
              <Play aria-hidden className="size-8 translate-x-0.5" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="text-muted-foreground mt-2 text-sm">
        {vi.video.source}: {video.channel} ·{" "}
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="underline">
          {vi.video.watchOnYouTube}
        </a>
      </figcaption>
    </figure>
  );
}
