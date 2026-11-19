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
 * RSVP entrance: heading, monogram, and compliments reveal smoothly on arrival.
 */
export function useRsvpReveal({ root, enabled, reducedMotion }: Args) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!enabled || !el || reducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      const headingTl = buildHeadingReveal({
        kicker: q(".rsvp__kicker"),
        title: q(".rsvp__title"),
        rules: q(".rsvp__divider .ornament__rule"),
        gem: q(".rsvp__divider .ornament__gem"),
      });
      addDetailReveal(headingTl, q(".rsvp__monogram"), 0, { y: 8, scale: 0.97, duration: 0.45 });
      const detailsTl = gsap.timeline({ paused: true });
      addDetailReveal(detailsTl, q(".rsvp__closing"), 0, { y: 8, scale: 1, duration: 0.4 });

      const paw = q(".rsvp__paw");
      gsap.set(paw, { opacity: 0, scale: 1.55, y: -10, rotation: -14, transformOrigin: "50% 82%" });
      const pawTl = gsap.timeline({ paused: true });
      pawTl
        .to({}, { duration: 0.15 })
        .to(paw, { opacity: 1, scale: 0.88, y: 1, rotation: 3, duration: 0.2, ease: "power3.in" })
        .to(paw, { scale: 1, y: 0, rotation: 0, duration: 0.28, ease: "back.out(2)" })
        .set(paw, { clearProps: "opacity,transform,transformOrigin" });

      const unsub = onArrival("rsvp", async () => {
        headingTl.restart();
        await headingTl;
        detailsTl.restart();
        await detailsTl;
        pawTl.restart();
      });

      return () => {
        unsub();
        headingTl.kill();
        detailsTl.kill();
        pawTl.kill();
      };
    }, el);

    return () => ctx.revert();
  }, [enabled, reducedMotion, root]);
}
