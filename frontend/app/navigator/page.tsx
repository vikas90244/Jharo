"use client";

import { useRef, useState } from "react";

export default function CustomSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  const max = 303;

  function updateFromPointer(clientX: number) {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();

    const position = clientX - rect.left;
    const percentage = position / rect.width;

    const nextValue = Math.round(
      Math.min(1, Math.max(0, percentage)) * max
    );

    setValue(nextValue);
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX);
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (event.buttons !== 1) return;

    updateFromPointer(event.clientX);
  }

  const percentage = (value / max) * 100;

  return (
    <div className="w-full max-w-3xl px-6">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative h-8 cursor-pointer touch-none"
      >
        {/* Background track */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />

        {/* Progress track */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-md"
          style={{ left: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-sm text-muted-foreground">
        <span>Page 0</span>
        <span>
          Page {value} / {max}
        </span>
      </div>
    </div>
  );
}
