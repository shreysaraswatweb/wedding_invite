import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { onArrival } from "../stage/arrival";
import { addDetailReveal, buildHeadingReveal } from "./reveals";

type Args = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  enabled: boolean;
  reducedMotion: boolean;
};

/**
 * Venue entrance: heading and map details reveal smoothly once arrived.
 */
export function useVenueReveal({ root, enabled, reducedMotion }: Args) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!enabled || !el || reducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const frame = q(".venue__map-frame");

      const headingTl = buildHeadingReveal({
        kicker: q(".venue__kicker"),
        title: q(".venue__name"),
        rules: q(".venue__divider .ornament__rule"),
        gem: q(".venue__divider .ornament__gem"),
      });
      addDetailReveal(headingTl, q(".venue__address"), 0.5, { y: 8, scale: 1, duration: 0.4 });

      const mapTl = gsap.timeline({ paused: true });
      addDetailReveal(mapTl, frame, 0, { y: 16, scale: 0.99, duration: 0.6 });
      addDetailReveal(mapTl, q(".venue__directions"), 0.2, { y: 8, scale: 1, duration: 0.4 });
      mapTl.eventCallback("onComplete", () => {
        gsap.set(frame, { clearProps: "transform" });
      });

      const unsub = onArrival("venue", async () => {
        headingTl.restart();
        await headingTl;
        mapTl.restart();
      });

      return () => {
        unsub();
        headingTl.kill();
        mapTl.kill();
      };
    }, el);

    return () => ctx.revert();
  }, [enabled, reducedMotion, root]);
}
