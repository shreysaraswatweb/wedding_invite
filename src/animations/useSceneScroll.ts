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
  const invitationRevealRef = useRef<gsap.core.Timeline | null>(null);
  const countdownRevealRef = useRef<gsap.core.Timeline | null>(null);
  const videoCompletedRef = useRef(videoCompleted);

  useEffect(() => {
    videoCompletedRef.current = videoCompleted;
  }, [videoCompleted]);

  useLayoutEffect(() => {
    if (!enabled || !root.current) return;

    const ctx = gsap.context(() => {
      const hero = root.current!.querySelector<HTMLElement>(".scene-hero");
      const bgOne = root.current!.querySelector<HTMLElement>(".scene-bg--one");
      const bgCard = root.current!.querySelector<HTMLElement>(".scene-bg--card");
      const bgTwo = root.current!.querySelector<HTMLElement>(".scene-bg--two");
      const copyTwo = root.current!.querySelector<HTMLElement>(".scene-copy--two");
      const formalCard = root.current!.querySelector<HTMLElement>(".scene-formal-card");

      if (!hero || !bgOne || !bgTwo || !copyTwo) return;

      const logo = hero.querySelector<HTMLElement>(".scene-logo");
      const nameEls = hero.querySelectorAll<HTMLElement>(".scene-names__name");
      const amp = hero.querySelector<HTMLElement>(".scene-names__amp");
      const marriedText = hero.querySelector<HTMLElement>(".scene-hero__married");

      // Initial state: Step 0 (Hero page with Video 1 active, Page 2 & Countdown hidden)
      gsap.set(bgOne, { opacity: 1 });
      if (bgCard) gsap.set(bgCard, { opacity: 0 });
      if (formalCard) gsap.set(formalCard, { opacity: 0, autoAlpha: 0, pointerEvents: "none" });
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

      // --- Page 2: Formal Invitation Reveal (Paramveer & Barkha) ---
      const blessingEl = formalCard?.querySelector<HTMLElement>(".scene-formal-card__blessing");
      const personEls = formalCard?.querySelectorAll<HTMLElement>(".scene-formal-card__person");
      const groomName = personEls?.[0]?.querySelector<HTMLElement>(".scene-formal-card__name");
      const groomParents = personEls?.[0]?.querySelector<HTMLElement>(".scene-formal-card__parents");
      const brideName = personEls?.[1]?.querySelector<HTMLElement>(".scene-formal-card__name");
      const brideParents = personEls?.[1]?.querySelector<HTMLElement>(".scene-formal-card__parents");

      if (blessingEl) gsap.set(blessingEl, { opacity: 0, y: 14 });
      if (groomName) gsap.set(groomName, { opacity: 0, y: 16, scale: 0.96 });
      if (groomParents) gsap.set(groomParents, { opacity: 0, y: 10 });
      if (brideName) gsap.set(brideName, { opacity: 0, y: 16, scale: 0.96 });
      if (brideParents) gsap.set(brideParents, { opacity: 0, y: 10 });

      const invitationReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      invitationRevealRef.current = invitationReveal;

      if (!reducedMotion) {
        if (blessingEl) {
          invitationReveal.fromTo(
            blessingEl,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
            0,
          );
        }
        if (groomName) {
          invitationReveal.fromTo(
            groomName,
            { opacity: 0, y: 16, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "+=0.2",
          );
        }
        if (groomParents) {
          invitationReveal.fromTo(
            groomParents,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.35",
          );
        }
        if (brideName) {
          invitationReveal.fromTo(
            brideName,
            { opacity: 0, y: 16, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "+=0.2",
          );
        }
        if (brideParents) {
          invitationReveal.fromTo(
            brideParents,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.35",
          );
        }
        invitationReveal.set(
          [blessingEl, groomName, groomParents, brideName, brideParents].filter(Boolean),
          { clearProps: "transform,filter" },
        );
      } else {
        invitationReveal.to(
          [blessingEl, groomName, groomParents, brideName, brideParents].filter(Boolean),
          { opacity: 1, duration: 0.4 },
        );
      }

      // --- Page 3: Countdown & Scratch Card Reveal ---
      const countdownKicker = copyTwo.querySelector<HTMLElement>(".scene-kicker");
      const countdownHeading = copyTwo.querySelector<HTMLElement>(".scene-two__heading");
      const countdownRules = copyTwo.querySelectorAll<HTMLElement>(".scene-two__divider .ornament__rule");
      const countdownGem = copyTwo.querySelector<HTMLElement>(".scene-two__divider .ornament__gem");
      const countdownScratch = copyTwo.querySelector<HTMLElement>(".scene-two__scratch");
      const countdownPanel = copyTwo.querySelector<HTMLElement>(".scene-two__countdown-panel");

      if (countdownKicker) gsap.set(countdownKicker, { opacity: 0, y: 8 });
      if (countdownHeading) gsap.set(countdownHeading, { opacity: 0, y: 12, scale: 0.985 });
      if (countdownRules && countdownRules.length > 0) gsap.set(countdownRules, { opacity: 0, scaleX: 0 });
      if (countdownGem) gsap.set(countdownGem, { opacity: 0, scale: 0.4, rotation: -45 });
      if (countdownScratch) gsap.set(countdownScratch, { opacity: 0, y: 12, scale: 0.98 });
      if (countdownPanel) gsap.set(countdownPanel, { opacity: 0, y: 14, scale: 0.98 });

      const countdownReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      countdownRevealRef.current = countdownReveal;

      if (!reducedMotion) {
        if (countdownKicker) {
          countdownReveal.fromTo(
            countdownKicker,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4 },
            0,
          );
        }
        if (countdownHeading) {
          countdownReveal.fromTo(
            countdownHeading,
            { opacity: 0, y: 12, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5 },
            0.08,
          );
        }
        if (countdownRules && countdownRules.length > 0) {
          countdownReveal.fromTo(
            countdownRules,
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 0.45, ease: "power2.inOut" },
            0.22,
          );
        }
        if (countdownGem) {
          countdownReveal.fromTo(
            countdownGem,
            { opacity: 0, scale: 0.4, rotation: -45 },
            { opacity: 1, scale: 1, rotation: 0, duration: 0.35, transformOrigin: "50% 50%" },
            0.32,
          );
        }
        if (countdownScratch) {
          countdownReveal.fromTo(
            countdownScratch,
            { opacity: 0, y: 12, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5 },
            0.42,
          );
        }
        if (countdownPanel) {
          countdownReveal.fromTo(
            countdownPanel,
            { opacity: 0, y: 14, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55 },
            0.52,
          );
        }
        countdownReveal.set(
          [countdownKicker, countdownHeading, countdownRules, countdownGem, countdownScratch, countdownPanel].filter(Boolean),
          { clearProps: "transform,filter" },
        );
      } else {
        countdownReveal.to(
          [countdownKicker, countdownHeading, countdownRules, countdownGem, countdownScratch, countdownPanel].filter(Boolean),
          { opacity: 1, duration: 0.4 },
        );
      }

      // Event listener for arriving back at the hero chapter (Page 1)
      const unsubHero = onArrival("hero", () => {
        if (namesRevealRef.current && videoCompletedRef.current) {
          namesRevealRef.current.restart();
        }
      });

      // Event listener for arriving at the formal invitation chapter (Page 2)
      const unsubInvitation = onArrival("invitation", () => {
        if (invitationRevealRef.current) {
          invitationRevealRef.current.restart();
        }
      });

      // Event listener for arriving at the countdown chapter (Page 3)
      const unsubCountdown = onArrival("countdown", () => {
        copyTwo.classList.add("is-interactive");
        window.dispatchEvent(new Event("resize"));
        if (countdownRevealRef.current) {
          countdownRevealRef.current.restart();
        }
      });

      return () => {
        namesReveal.kill();
        namesRevealRef.current = null;
        invitationReveal.kill();
        invitationRevealRef.current = null;
        countdownReveal.kill();
        countdownRevealRef.current = null;
        unsubHero();
        unsubInvitation();
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
