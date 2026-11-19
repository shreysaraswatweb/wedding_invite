import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { onArrival } from "../stage/arrival";
import { addDetailReveal, buildHeadingReveal } from "./reveals";

type Args = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  sceneId: string;
  enabled: boolean;
  reducedMotion: boolean;
};

/**
 * Programme-day choreography: once the day has snapped into place, the heading
 * and then each event play in sequence. Scroll stays free so the page never sticks.
 */
export function useProgrammeScroll({ root, stage, sceneId, enabled, reducedMotion }: Args) {
  useLayoutEffect(() => {
    const el = root.current;
    const stageEl = stage.current;
    if (!enabled || !el || !stageEl || reducedMotion) return;

    const q = gsap.utils.selector(el);
    const headingTl = buildHeadingReveal({
      glow: q(".programme__glow"),
      kicker: q(".programme__kicker"),
      title: q(".programme__title"),
      rules: q(".programme__divider .ornament__rule"),
      gem: q(".programme__divider .ornament__gem"),
    });

    const eventTls = q(".programme__event").map((item) => {
      const connector = item.querySelector(".programme__connector");
      const node = item.querySelector(".programme__node");
      const label = item.querySelector(".programme__event-title");
      const time = item.querySelector(".programme__time");
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      let at = 0;

      if (connector) {
        tl.fromTo(
          connector,
          { opacity: 0, scaleY: 0 },
          { opacity: 1, scaleY: 1, duration: 0.25, ease: "power1.inOut" },
          0,
        );
        at = 0.12;
      }

      tl.fromTo(node, { opacity: 0, scale: 0.3, rotation: 45 }, { opacity: 1, scale: 1, rotation: 45, duration: 0.25 }, at);
      addDetailReveal(tl, label, at + 0.04);
      tl.fromTo(time, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, at + 0.12);

      return tl;
    });

    const unsub = onArrival(sceneId, async () => {
      headingTl.restart();
      await headingTl;
      for (const tl of eventTls) {
        tl.restart();
        await tl;
      }
    });

    return () => {
      unsub();
      headingTl.kill();
      eventTls.forEach((tl) => tl.kill());
    };
  }, [enabled, reducedMotion, root, stage, sceneId]);
}
