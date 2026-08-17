"use client";

import { useEffect } from "react";

interface ScrollToTargetProps {
  block?: ScrollLogicalPosition;
  behavior?: ScrollBehavior;
  targetId: string;
}

export function ScrollToTarget({
  block = "center",
  behavior = "smooth",
  targetId,
}: ScrollToTargetProps) {
  useEffect(() => {
    if (window.location.hash) {
      return;
    }

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : behavior,
        block,
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [behavior, block, targetId]);

  return null;
}
