"use client";

/**
 * JOURNEY — "The 200 milliseconds after you click."
 * The home page's centrepiece: a scroll-scrubbed film in six cuts
 * (click → pixel → auction → broker → breach → shield), cast with the
 * visitor's own Shadow Profile. Reduced motion gets a static storyboard.
 */

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useShadow } from "@/lib/shadow";
import { Film } from "./journey/Film";
import { toPackets } from "./journey/model";
import { Storyboard } from "./journey/Storyboard";

export function Journey() {
  const { fields, redacted, price } = useShadow();
  const packets = useMemo(() => toPackets(fields, redacted), [fields, redacted]);
  const reduce = useReducedMotion();
  // gate on mount so SSR and first client render agree
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (mounted && reduce) return <Storyboard packets={packets} price={price} />;
  return <Film packets={packets} price={price} />;
}
