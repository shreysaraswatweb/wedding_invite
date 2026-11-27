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
  const haldiRevealRef = useRef<gsap.core.Timeline | null>(null);
  const weddingRevealRef = useRef<gsap.core.Timeline | null>(null);
  const receptionRevealRef = useRef<gsap.core.Timeline | null>(null);
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
      const bgThree = root.current!.querySelector<HTMLElement>(".scene-bg--three");
      const bgFour = root.current!.querySelector<HTMLElement>(".scene-bg--four");
      const bgFive = root.current!.querySelector<HTMLElement>(".scene-bg--five");
      const copyTwo = root.current!.querySelector<HTMLElement>(".scene-copy--two");
      const copyThree = root.current!.querySelector<HTMLElement>(".scene-copy--three");
      const copyFour = root.current!.querySelector<HTMLElement>(".scene-copy--four");
      const copyFive = root.current!.querySelector<HTMLElement>(".scene-copy--five");
      const formalCard = root.current!.querySelector<HTMLElement>(".scene-formal-card");

      if (!hero || !bgOne || !bgTwo || !copyTwo) return;

      const logo = hero.querySelector<HTMLElement>(".scene-logo");
      const nameFirst = hero.querySelector<HTMLElement>(".scene-hero__name--first, .scene-hero__art--lakshay, .scene-names__name--first");
      const ampWrap = hero.querySelector<HTMLElement>(".scene-hero__amp, .scene-hero__art--amp, .scene-names__amp-wrap");
      const nameSecond = hero.querySelector<HTMLElement>(".scene-hero__name--second, .scene-hero__art--prerna, .scene-names__name--second");
      const marriedText = hero.querySelector<HTMLElement>(".scene-hero__married, .scene-hero__art--married");
      const heroDivider = hero.querySelector<HTMLElement>(".scene-hero__divider, .scene-hero__art--divider");

      const haldiEl = root.current!.querySelector<HTMLElement>(".scene-haldi");
      const haldiTitle = haldiEl?.querySelector<HTMLElement>(".scene-haldi__title, .scene-haldi__art--title");
      const haldiDate = haldiEl?.querySelector<HTMLElement>(".scene-haldi__date, .scene-haldi__art--date");
      const haldiDivider = haldiEl?.querySelector<HTMLElement>(".scene-haldi__divider, .scene-haldi__art--divider");
      const haldiDay = haldiEl?.querySelector<HTMLElement>(".scene-haldi__day, .scene-haldi__art--day");
      const haldiVenue = haldiEl?.querySelector<HTMLElement>(".scene-haldi__venue, .scene-haldi__art--venue");
      const haldiTime = haldiEl?.querySelector<HTMLElement>(".scene-haldi__time, .scene-haldi__art--time");
      const haldiDirections = haldiEl?.querySelector<HTMLElement>(".scene-haldi__directions");

      const weddingEl = copyFour?.querySelector<HTMLElement>(".scene-wedding");
      const weddingTitle = weddingEl?.querySelector<HTMLElement>(".scene-wedding__title");
      const weddingDate = weddingEl?.querySelector<HTMLElement>(".scene-wedding__date");
      const weddingDivider = weddingEl?.querySelector<HTMLElement>(".scene-wedding__divider");
      const weddingDay = weddingEl?.querySelector<HTMLElement>(".scene-wedding__day");
      const weddingVenue = weddingEl?.querySelector<HTMLElement>(".scene-wedding__venue");
      const weddingTime = weddingEl?.querySelector<HTMLElement>(".scene-wedding__time");
      const weddingDirections = weddingEl?.querySelector<HTMLElement>(".scene-wedding__directions");

      const receptionEl = copyFive?.querySelector<HTMLElement>(".scene-reception");
      const receptionTitle = receptionEl?.querySelector<HTMLElement>(".scene-reception__title");
      const receptionDate = receptionEl?.querySelector<HTMLElement>(".scene-reception__date");
      const receptionDivider = receptionEl?.querySelector<HTMLElement>(".scene-reception__divider");
      const receptionDay = receptionEl?.querySelector<HTMLElement>(".scene-reception__day");
      const receptionVenue = receptionEl?.querySelector<HTMLElement>(".scene-reception__venue");
      const receptionTime = receptionEl?.querySelector<HTMLElement>(".scene-reception__time");
      const receptionDirections = receptionEl?.querySelector<HTMLElement>(".scene-reception__directions");

      // Initial state: Step 0 (Hero page with Video 1 active, Page 2 & Countdown hidden)
      gsap.set(bgOne, { opacity: 1 });
      if (bgCard) gsap.set(bgCard, { opacity: 0 });
      if (formalCard) gsap.set(formalCard, { opacity: 0, autoAlpha: 0, pointerEvents: "none" });
      gsap.set(bgTwo, { opacity: 0 });
      gsap.set(copyTwo, { opacity: 0, pointerEvents: "none" });
      if (bgThree) gsap.set(bgThree, { opacity: 0 });
      if (copyThree) gsap.set(copyThree, { opacity: 0, autoAlpha: 0, pointerEvents: "none" });
      if (bgFour) gsap.set(bgFour, { opacity: 0 });
      if (copyFour) gsap.set(copyFour, { opacity: 0, autoAlpha: 0, pointerEvents: "none" });
      if (bgFive) gsap.set(bgFive, { opacity: 0 });
      if (copyFive) gsap.set(copyFive, { opacity: 0, autoAlpha: 0, pointerEvents: "none" });
      gsap.set(hero, { opacity: 1, pointerEvents: "auto" });

      // Elements to be revealed: start completely hidden
      if (logo) gsap.set(logo, { opacity: 0, y: -14, scale: 0.88 });
      if (nameFirst) gsap.set(nameFirst, { opacity: 0, y: 14, scale: 0.96 });
      if (ampWrap) gsap.set(ampWrap, { opacity: 0, y: 10, scale: 0.8 });
      if (nameSecond) gsap.set(nameSecond, { opacity: 0, y: 14, scale: 0.96 });
      if (marriedText) gsap.set(marriedText, { opacity: 0, y: 12 });
      if (heroDivider) gsap.set(heroDivider, { opacity: 0, scaleX: 0 });

      if (haldiTitle) gsap.set(haldiTitle, { opacity: 0, y: 16, scale: 0.94 });
      if (haldiDate) gsap.set(haldiDate, { opacity: 0, y: 12 });
      if (haldiDivider) gsap.set(haldiDivider, { opacity: 0, scaleX: 0 });
      if (haldiDay) gsap.set(haldiDay, { opacity: 0, y: 10 });
      if (haldiVenue) gsap.set(haldiVenue, { opacity: 0, y: 14, scale: 0.97 });
      if (haldiTime) gsap.set(haldiTime, { opacity: 0, y: 10 });
      if (haldiDirections) gsap.set(haldiDirections, { opacity: 0, y: 10, scale: 0.95 });

      if (weddingTitle) gsap.set(weddingTitle, { opacity: 0, y: 16, scale: 0.94 });
      if (weddingDate) gsap.set(weddingDate, { opacity: 0, y: 12 });
      if (weddingDivider) gsap.set(weddingDivider, { opacity: 0, scaleX: 0 });
      if (weddingDay) gsap.set(weddingDay, { opacity: 0, y: 10 });
      if (weddingVenue) gsap.set(weddingVenue, { opacity: 0, y: 14, scale: 0.97 });
      if (weddingTime) gsap.set(weddingTime, { opacity: 0, y: 10 });
      if (weddingDirections) gsap.set(weddingDirections, { opacity: 0, y: 10, scale: 0.95 });

      if (receptionTitle) gsap.set(receptionTitle, { opacity: 0, y: 16, scale: 0.94 });
      if (receptionDate) gsap.set(receptionDate, { opacity: 0, y: 12 });
      if (receptionDivider) gsap.set(receptionDivider, { opacity: 0, scaleX: 0 });
      if (receptionDay) gsap.set(receptionDay, { opacity: 0, y: 10 });
      if (receptionVenue) gsap.set(receptionVenue, { opacity: 0, y: 14, scale: 0.97 });
      if (receptionTime) gsap.set(receptionTime, { opacity: 0, y: 10 });
      if (receptionDirections) gsap.set(receptionDirections, { opacity: 0, y: 10, scale: 0.95 });

      // Distinct 3-Stage Reveal Timeline:
      // Stage 1: Logo revealed all by itself, then settles.
      // Stage 2: Names & gilded botanical '&' revealed ("Lakshay & Prerna"), then settle.
      // Stage 3: "ARE GETTING MARRIED" + ornamental filigree divider reveal together.
      const namesReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      namesRevealRef.current = namesReveal;

      if (!reducedMotion) {
        if (logo) {
          namesReveal.fromTo(
            logo,
            { opacity: 0, scale: 0.88, y: -14 },
            { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: "power2.out" },
            0,
          );
        }
        if (nameFirst) {
          namesReveal.fromTo(
            nameFirst,
            { opacity: 0, y: 14, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "+=0.25",
          );
        }
        if (ampWrap) {
          namesReveal.fromTo(
            ampWrap,
            { opacity: 0, y: 10, scale: 0.75 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" },
            "-=0.35",
          );
        }
        if (nameSecond) {
          namesReveal.fromTo(
            nameSecond,
            { opacity: 0, y: 14, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "-=0.35",
          );
        }
        if (marriedText) {
          namesReveal.fromTo(
            marriedText,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
            "+=0.3",
          );
        }
        if (heroDivider) {
          namesReveal.fromTo(
            heroDivider,
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 0.7, ease: "power2.inOut" },
            "-=0.4",
          );
        }
        namesReveal.set([logo, nameFirst, ampWrap, nameSecond, marriedText, heroDivider].filter(Boolean), {
          clearProps: "transform,filter",
        });
      } else {
        namesReveal
          .to(logo, { opacity: 1, duration: 0.4 })
          .to([nameFirst, ampWrap, nameSecond].filter(Boolean), { opacity: 1, duration: 0.4 }, "+=0.2")
          .to([marriedText, heroDivider].filter(Boolean), { opacity: 1, duration: 0.4 }, "+=0.2");
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

      // --- Page 4: Haldi Ceremony Reveal ---
      const haldiReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      haldiRevealRef.current = haldiReveal;

      if (!reducedMotion) {
        if (haldiTitle) {
          haldiReveal.fromTo(
            haldiTitle,
            { opacity: 0, y: 16, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
            0,
          );
        }
        if (haldiDate) {
          haldiReveal.fromTo(
            haldiDate,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            "+=0.2",
          );
        }
        if (haldiDivider) {
          haldiReveal.fromTo(
            haldiDivider,
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.inOut" },
            "-=0.35",
          );
        }
        if (haldiDay) {
          haldiReveal.fromTo(
            haldiDay,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.2",
          );
        }
        if (haldiVenue) {
          haldiReveal.fromTo(
            haldiVenue,
            { opacity: 0, y: 14, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "+=0.15",
          );
        }
        if (haldiTime) {
          haldiReveal.fromTo(
            haldiTime,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
            "-=0.25",
          );
        }
        if (haldiDirections) {
          haldiReveal.fromTo(
            haldiDirections,
            { opacity: 0, y: 10, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "power2.out" },
            "-=0.2",
          );
        }
        haldiReveal.set(
          [haldiTitle, haldiDate, haldiDivider, haldiDay, haldiVenue, haldiTime, haldiDirections].filter(Boolean),
          { clearProps: "transform,filter" },
        );
      } else {
        if (haldiTitle) {
          haldiReveal.to(haldiTitle, { opacity: 1, duration: 0.4 });
        }
        const g1 = [haldiDate, haldiDivider].filter(Boolean) as HTMLElement[];
        if (g1.length > 0) {
          haldiReveal.to(g1, { opacity: 1, duration: 0.4 }, "+=0.2");
        }
        const g2 = [haldiDay, haldiVenue, haldiTime, haldiDirections].filter(Boolean) as HTMLElement[];
        if (g2.length > 0) {
          haldiReveal.to(g2, { opacity: 1, duration: 0.4 }, "+=0.2");
        }
      }

      // --- Page 5: Wedding Ceremony Reveal ---
      const weddingReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      weddingRevealRef.current = weddingReveal;

      if (!reducedMotion) {
        if (weddingTitle) {
          weddingReveal.fromTo(
            weddingTitle,
            { opacity: 0, y: 16, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
            2.0,
          );
        }
        if (weddingDate) {
          weddingReveal.fromTo(
            weddingDate,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            "+=0.2",
          );
        }
        if (weddingDivider) {
          weddingReveal.fromTo(
            weddingDivider,
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.inOut" },
            "-=0.35",
          );
        }
        if (weddingDay) {
          weddingReveal.fromTo(
            weddingDay,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.2",
          );
        }
        if (weddingVenue) {
          weddingReveal.fromTo(
            weddingVenue,
            { opacity: 0, y: 14, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "+=0.15",
          );
        }
        if (weddingTime) {
          weddingReveal.fromTo(
            weddingTime,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
            "-=0.25",
          );
        }
        if (weddingDirections) {
          weddingReveal.fromTo(
            weddingDirections,
            { opacity: 0, y: 10, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "power2.out" },
            "-=0.2",
          );
        }
        weddingReveal.set(
          [weddingTitle, weddingDate, weddingDivider, weddingDay, weddingVenue, weddingTime, weddingDirections].filter(Boolean),
          { clearProps: "transform,filter" },
        );
      } else {
        if (weddingTitle) {
          weddingReveal.to(weddingTitle, { opacity: 1, duration: 0.4 }, 2.0);
        }
        const g1 = [weddingDate, weddingDivider].filter(Boolean) as HTMLElement[];
        if (g1.length > 0) {
          weddingReveal.to(g1, { opacity: 1, duration: 0.4 }, "+=0.2");
        }
        const g2 = [weddingDay, weddingVenue, weddingTime, weddingDirections].filter(Boolean) as HTMLElement[];
        if (g2.length > 0) {
          weddingReveal.to(g2, { opacity: 1, duration: 0.4 }, "+=0.2");
        }
      }

      // --- Page 6: Reception Reveal ---
      const receptionReveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      receptionRevealRef.current = receptionReveal;

      if (!reducedMotion) {
        if (receptionTitle) {
          receptionReveal.fromTo(
            receptionTitle,
            { opacity: 0, y: 16, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
            3.5,
          );
        }
        if (receptionDate) {
          receptionReveal.fromTo(
            receptionDate,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            "+=0.2",
          );
        }
        if (receptionDivider) {
          receptionReveal.fromTo(
            receptionDivider,
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.inOut" },
            "-=0.35",
          );
        }
        if (receptionDay) {
          receptionReveal.fromTo(
            receptionDay,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.2",
          );
        }
        if (receptionVenue) {
          receptionReveal.fromTo(
            receptionVenue,
            { opacity: 0, y: 14, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
            "+=0.15",
          );
        }
        if (receptionTime) {
          receptionReveal.fromTo(
            receptionTime,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
            "-=0.25",
          );
        }
        if (receptionDirections) {
          receptionReveal.fromTo(
            receptionDirections,
            { opacity: 0, y: 10, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "power2.out" },
            "-=0.2",
          );
        }
        receptionReveal.set(
          [receptionTitle, receptionDate, receptionDivider, receptionDay, receptionVenue, receptionTime, receptionDirections].filter(Boolean),
          { clearProps: "transform,filter" },
        );
      } else {
        if (receptionTitle) {
          receptionReveal.to(receptionTitle, { opacity: 1, duration: 0.4 }, 3.5);
        }
        const g1 = [receptionDate, receptionDivider].filter(Boolean) as HTMLElement[];
        if (g1.length > 0) {
          receptionReveal.to(g1, { opacity: 1, duration: 0.4 }, "+=0.2");
        }
        const g2 = [receptionDay, receptionVenue, receptionTime, receptionDirections].filter(Boolean) as HTMLElement[];
        if (g2.length > 0) {
          receptionReveal.to(g2, { opacity: 1, duration: 0.4 }, "+=0.2");
        }
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

      // Event listener for arriving at the celebrations / Haldi chapter (Page 4)
      const unsubCelebrations = onArrival("celebrations", () => {
        window.dispatchEvent(new Event("resize"));
        weddingRevealRef.current?.pause(0);
        if (haldiRevealRef.current) {
          haldiRevealRef.current.restart();
        }
      });

      // Event listener for arriving at ceremony 4 (Page 5)
      const unsubCeremonyFour = onArrival("ceremony-four", () => {
        window.dispatchEvent(new Event("resize"));
        receptionRevealRef.current?.pause(0);
        if (weddingRevealRef.current) {
          weddingRevealRef.current.restart();
        }
      });

      // Event listener for arriving at ceremony 5 (Page 6)
      const unsubCeremonyFive = onArrival("ceremony-five", () => {
        window.dispatchEvent(new Event("resize"));
        weddingRevealRef.current?.pause(0);
        if (receptionRevealRef.current) {
          receptionRevealRef.current.restart();
        }
      });

      return () => {
        namesReveal.kill();
        namesRevealRef.current = null;
        invitationReveal.kill();
        invitationRevealRef.current = null;
        countdownReveal.kill();
        countdownRevealRef.current = null;
        haldiReveal.kill();
        haldiRevealRef.current = null;
        weddingReveal.kill();
        weddingRevealRef.current = null;
        receptionReveal.kill();
        receptionRevealRef.current = null;
        unsubHero();
        unsubInvitation();
        unsubCountdown();
        unsubCelebrations();
        unsubCeremonyFour();
        unsubCeremonyFive();
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
