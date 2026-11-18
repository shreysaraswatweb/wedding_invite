import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { onArrival } from "../stage/arrival";

type Args = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  enabled: boolean;
  settled: boolean;
  reducedMotion: boolean;
  videoRendered?: boolean;
  videoCompleted?: boolean;
};

/**
 * Scene animation controller for the cinematic sequence.
 * Features the Opening Hero Page over Video 1:
 * Choreographed one-by-one fade in transition:
 * 1. Logo floats down and fades in
 * 2. Groom's name ("Lakshay") unblurs with letter-spacing collapse
 * 3. Gilded "&" bounces in
 * 4. Bride's name ("Prerna") unblurs with letter-spacing collapse
 * 5. Wedding line ("Are Getting Married") floats up and fades in
 */
export function useSceneScroll({
  root,
  enabled,
  reducedMotion,
  videoCompleted = false,
}: Args) {
  const namesRevealRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!enabled || !root.current) return;

    const ctx = gsap.context(() => {
      const hero = root.current!.querySelector<HTMLElement>(".scene-hero");
      const bgOne = root.current!.querySelector<HTMLElement>(".scene-bg--one");
      const bgTwo = root.current!.querySelector<HTMLElement>(".scene-bg--two");
      const copyTwo = root.current!.querySelector<HTMLElement>(".scene-copy--two");

      if (!hero || !bgOne || !bgTwo || !copyTwo) return;

      const logo = hero.querySelector<HTMLElement>(".scene-logo");
      const nameEls = hero.querySelectorAll<HTMLElement>(".scene-names__name");
      const amp = hero.querySelector<HTMLElement>(".scene-names__amp");
      const marriedText = hero.querySelector<HTMLElement>(".scene-hero__married");

      // Initial state: Step 0 (Hero page with Video 1 active, Countdown hidden)
      gsap.set(bgOne, { opacity: 1 });
      gsap.set(bgTwo, { opacity: 0 });
      gsap.set(copyTwo, { opacity: 0, pointerEvents: "none" });
      gsap.set(hero, { opacity: 1, pointerEvents: "auto" });

      // Elements to be revealed: start completely hidden
      if (logo) gsap.set(logo, { opacity: 0, y: -14, scale: 0.88 });
      if (nameEls && nameEls[0]) gsap.set(nameEls[0], { opacity: 0, y: 12 });
      if (amp) gsap.set(amp, { opacity: 0, y: 10, scale: 0.8 });
      if (nameEls && nameEls[1]) gsap.set(nameEls[1], { opacity: 0, y: 12 });
      if (marriedText) gsap.set(marriedText, { opacity: 0, y: 14 });

      // Distinct 3-Stage Reveal Timeline:
      // Stage 1: Logo revealed all by itself, then settles.
      // Stage 2: Names & gilded '&' revealed ("Lakshay & Prerna"), then settle.
      // Stage 3: Invitation line revealed together.
      const namesReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      namesRevealRef.current = namesReveal;

      if (!reducedMotion) {
        namesReveal
          // --- STAGE 1: Logo reveals separately ---
          .fromTo(
            logo,
            { opacity: 0, scale: 0.88, y: -14 },
            { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power2.out" },
            0,
          )
          // --- STAGE 2: Once logo is revealed, Names and '&' reveal ---
          .fromTo(
            nameEls[0],
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
            "+=0.35",
          )
          .fromTo(
            amp,
            { opacity: 0, y: 10, scale: 0.75 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" },
            "-=0.35",
          )
          .fromTo(
            nameEls[1],
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
            "-=0.35",
          )
          // --- STAGE 3: Once names are revealed, Invitation line reveals together ---
          .fromTo(
            marriedText,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" },
            "+=0.4",
          )
          .set([logo, nameEls[0], amp, nameEls[1], marriedText].filter(Boolean), { clearProps: "transform,filter" });
      } else {
        namesReveal
          .to(logo, { opacity: 1, duration: 0.45 })
          .to([nameEls[0], amp, nameEls[1]].filter(Boolean), { opacity: 1, duration: 0.45 }, "+=0.3")
          .to(marriedText, { opacity: 1, duration: 0.45 }, "+=0.3");
      }

      // Ensure all elements inside copyTwo (Countdown, Scratch Card, Heading) are clean and crisp
      const copyTwoElements = copyTwo.querySelectorAll(
        ".scene-title, .scene-two__lead, .scene-two__divider, .ornament__rule, .ornament__gem, .scene-two__scratch, .scene-two__countdown-panel, .countdown__unit, .countdown__glyph, .countdown__message",
      );
      gsap.set(copyTwoElements, {
        opacity: 1,
        clearProps: "filter,clipPath",
      });

      // Event listener for arriving back at the hero chapter
      const unsubHero = onArrival("hero", () => {
        if (namesRevealRef.current) {
          if (namesRevealRef.current.progress() === 0) {
            namesRevealRef.current.play();
          } else {
            namesRevealRef.current.progress(1);
          }
        }
      });

      // Event listener for arriving at the countdown chapter
      const unsubCountdown = onArrival("countdown", () => {
        copyTwo.classList.add("is-interactive");
        window.dispatchEvent(new Event("resize"));
      });

      return () => {
        namesReveal.kill();
        namesRevealRef.current = null;
        unsubHero();
        unsubCountdown();
      };
    }, root);

    return () => ctx.revert();
  }, [enabled, reducedMotion, root]); // Note: videoCompleted is excluded to prevent unmounting/reverting GSAP

  // Trigger reveal once the full video finishes its initial 19s playthrough
  useEffect(() => {
    if (!enabled) return;

    if (videoCompleted && namesRevealRef.current) {
      namesRevealRef.current.play();
    }
  }, [enabled, videoCompleted]);
}
