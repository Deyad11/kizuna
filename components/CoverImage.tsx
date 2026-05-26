/**
 * CoverImage component
 *
 * Shows the AniList cover if available, otherwise renders a styled
 * letter avatar using the first character of the title.
 *
 * Drop-in replacement for <img> in all three pages.
 *
 * Usage:
 *   <CoverImage src={covers[title]} title={title} className={styles.liveCardImg} />
 */

import React, { useState } from "react";

// 8 distinct hues that work on dark text — covers most colour variety
const PALETTE = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#34d399", // emerald
  "#f97316", // orange
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f43f5e", // rose
];

function pickColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface CoverImageProps {
  src?: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  /** If true, render as a <div> background (for panels that use background-image) */
  asBackground?: boolean;
}

export function CoverImage({
  src,
  title,
  className,
  style,
  asBackground = false,
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  const letter = title.trim().charAt(0).toUpperCase();
  const bg = pickColor(title);

  const showFallback = !src || failed;

  if (asBackground) {
    // For panels that use backgroundImage style
    if (showFallback) {
      return (
        <div
          className={className}
          style={{
            ...style,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "clamp(2rem, 8vw, 4rem)",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-sans, sans-serif)",
              lineHeight: 1,
            }}
          >
            {letter}
          </span>
        </div>
      );
    }
    return (
      <div
        className={className}
        style={{ ...style, backgroundImage: `url(${src})` }}
      />
    );
  }

  // Standard <img> replacement
  if (showFallback) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "var(--font-sans, sans-serif)",
            lineHeight: 1,
          }}
        >
          {letter}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

export default CoverImage;
