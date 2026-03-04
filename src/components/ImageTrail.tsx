"use client";

import { useMemo } from "react";

interface ImageTrailProps {
  images: string[];
}

export default function ImageTrail({ images }: ImageTrailProps) {
  const displayImages = useMemo(() => {
    if (images.length === 0) return [];
    const items = images.slice(0, 20);
    return [...items, ...items];
  }, [images]);

  if (displayImages.length === 0) return null;

  const singleSetWidth = displayImages.length / 2;
  const animationDuration = `${Math.max(singleSetWidth * 3, 20)}s`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl h-36 md:h-44 bg-gray-50">
      <div
        className="flex gap-3 h-full items-center animate-image-trail"
        style={
          {
            width: "max-content",
            "--trail-duration": animationDuration,
          } as React.CSSProperties
        }
      >
        {displayImages.map((url, i) => (
          <div
            key={i}
            className="h-28 md:h-36 w-40 md:w-52 flex-shrink-0 rounded-xl overflow-hidden shadow-sm"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/placeholder.jpg";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
