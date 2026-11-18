import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { arriveAt } from "./arrival";
import { STAGE_STEPS } from "./stageSteps";
import { haptic } from "../utils/haptic";

type Args = {
  stage: RefObject<HTMLElement | null>;
  enabled: boolean;
  settled?: boolean;
  reducedMotion: boolean;
  onSceneChange?: (sceneId: string) => void;
  onStepChange?: (stepIndex: number) => void;
};

/**
 * Master One-Stroke Chapter Controller.
 *
 * 7-Chapter Flow:
 * 0: The P&L Wedding (Opening calligraphy script & garden pavilion)
 * 1: Bride & Groom (Hero portrait, arch, names & petal burst)
 * 2: Countdown to Forever (Dusk gateway, scratch card & live timer)
 * 3: 11 December (Sagai, Mehndi, Dinner)
 * 4: 12 December (Haldi, Sehra Bandi, Dinner)
 * 5: Venue (Chopra Farms & Resorts, Google Maps)
 * 6: RSVP (Kriti & Ajinkya, Alex compliments)
 */
export function useStageTransitions({
  stage,
  enabled,
  settled: _settled = true,
  reducedMotion,
  onSceneChange,
  onStepChange,
}: Args) {
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const autoTimerRef = useRef<number | null>(null);
  const hasAutoAdvancedRef = useRef(false);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  // Store latest props in a ref for safe, zero-dependency callbacks
  const propsRef = useRef({ stage, enabled, reducedMotion, onSceneChange, onStepChange });
  useEffect(() => {
    propsRef.current = { stage, enabled, reducedMotion, onSceneChange, onStepChange };
  });

  // Direct programmatic jump to any step
  const goToStep = useCallback((targetStep: number, force = false) => {
    clearAutoTimer();
    hasAutoAdvancedRef.current = true;

    const { stage: stageRef, enabled: isEnabled, reducedMotion: isReduced, onSceneChange: notifyScene, onStepChange: notifyStep } = propsRef.current;
    const stageEl = stageRef.current;
    if (!isEnabled || !stageEl) return;
    if (targetStep < 0 || targetStep >= STAGE_STEPS.length) return;
    if (targetStep === currentStepRef.current && !force) return;
    if (isTransitioningRef.current && !force) return;

    isTransitioningRef.current = true;
    // Release the transition lock after 280ms so subsequent strokes are immediately responsive
    window.setTimeout(() => {
      isTransitioningRef.current = false;
    }, 280);

    const from = currentStepRef.current;
    const to = targetStep;
    currentStepRef.current = to;
    setCurrentStep(to);
    notifyStep?.(to);

    // DOM layer references
    const cinemaEl = stageEl.querySelector<HTMLElement>('[data-stage-scene="cinema"]');
    const day11El = stageEl.querySelector<HTMLElement>('[data-stage-scene="day-dec-11"]');
    const day12El = stageEl.querySelector<HTMLElement>('[data-stage-scene="day-dec-12"]');
    const venueEl = stageEl.querySelector<HTMLElement>('[data-stage-scene="venue"]');
    const rsvpEl = stageEl.querySelector<HTMLElement>('[data-stage-scene="rsvp"]');

    const heroEl = cinemaEl?.querySelector<HTMLElement>(".scene-hero");
    const bgTwo = cinemaEl?.querySelector<HTMLElement>(".scene-bg--two");
    const copyTwo = cinemaEl?.querySelector<HTMLElement>(".scene-copy--two");

    const layerMap: Record<number, HTMLElement | null> = {
      0: cinemaEl,
      1: cinemaEl,
      2: day11El,
      3: day12El,
      4: venueEl,
      5: rsvpEl,
    };

    const fromLayer = layerMap[from];
    const toLayer = layerMap[to];
    const duration = isReduced ? 0.2 : 0.45;
    const ease = "power2.out";
    const isForward = to > from;

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioningRef.current = false;
        // Ensure non-active layers are strictly hidden and inert
        const allLayers = [cinemaEl, day11El, day12El, venueEl, rsvpEl];
        allLayers.forEach((layer) => {
          if (!layer) return;
          const isCurrent = layer === toLayer;
          layer.classList.toggle("is-current", isCurrent);
          if (!isCurrent) {
            gsap.set(layer, { autoAlpha: 0, opacity: 0, pointerEvents: "none" });
          } else {
            gsap.set(layer, { autoAlpha: 1, opacity: 1, pointerEvents: "auto" });
          }
        });

        // If active in cinema, strictly ensure correct sub-view is visible and active
        if (toLayer === cinemaEl) {
          if (to === 0) {
            if (bgTwo) gsap.set(bgTwo, { opacity: 0 });
            if (copyTwo) {
              gsap.set(copyTwo, { opacity: 0, autoAlpha: 0, pointerEvents: "none" });
              copyTwo.classList.remove("is-interactive");
            }
            if (heroEl) gsap.set(heroEl, { opacity: 1, pointerEvents: "auto" });
          } else if (to === 1) {
            if (heroEl) gsap.set(heroEl, { opacity: 0, pointerEvents: "none" });
            if (bgTwo) gsap.set(bgTwo, { opacity: 1 });
            if (copyTwo) {
              gsap.set(copyTwo, { opacity: 1, autoAlpha: 1, pointerEvents: "auto" });
              copyTwo.classList.add("is-interactive");
            }
          }
        }

        // Inform arrival triggers
        const targetStepObj = STAGE_STEPS[to];
        notifyScene?.(targetStepObj.sceneId);
        void arriveAt(targetStepObj.id);
      },
    });

    // CASE 1: Moving within Cinema (0: Hero <-> 1: Countdown)
    if (fromLayer === cinemaEl && toLayer === cinemaEl) {
      if (cinemaEl) {
        gsap.set(cinemaEl, { autoAlpha: 1, opacity: 1, pointerEvents: "auto" });
      }

      // Hide the departing cinema sub-view
      if (from === 0 && heroEl) {
        tl.to(heroEl, { opacity: 0, y: -14, duration: duration * 0.7, ease: "power2.inOut" }, 0);
        tl.set(heroEl, { pointerEvents: "none" });
      } else if (from === 1) {
        if (copyTwo) {
          copyTwo.classList.remove("is-interactive");
          tl.to(copyTwo, { opacity: 0, autoAlpha: 0, y: 14, duration: duration * 0.7, ease: "power2.inOut" }, 0);
          tl.set(copyTwo, { pointerEvents: "none" });
        }
        if (bgTwo) {
          tl.to(bgTwo, { opacity: 0, duration: duration * 0.8, ease: "power2.inOut" }, 0);
        }
      }

      // Reveal the arriving cinema sub-view
      if (to === 0 && heroEl) {
        tl.set(heroEl, { pointerEvents: "auto" });
        tl.fromTo(heroEl, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration, ease }, duration * 0.15);
      } else if (to === 1) {
        if (bgTwo) {
          tl.to(bgTwo, { opacity: 1, duration: duration * 0.8, ease: "power2.inOut" }, 0);
        }
        if (copyTwo) {
          copyTwo.classList.add("is-interactive");
          tl.set(copyTwo, { pointerEvents: "auto" }, 0);
          tl.fromTo(copyTwo, { opacity: 0, autoAlpha: 0, y: 14 }, { opacity: 1, autoAlpha: 1, y: 0, duration, ease }, duration * 0.15);
        }
      }
    } else {
      // CASE 2: Moving across full stage layers
      if (fromLayer) {
        if (fromLayer === cinemaEl) {
          if (heroEl) gsap.set(heroEl, { opacity: 0, pointerEvents: "none" });
        }
        tl.to(
          fromLayer,
          {
            opacity: 0,
            scale: isReduced ? 1 : isForward ? 0.98 : 1.02,
            duration: duration * 0.85,
            ease: "power2.inOut",
          },
          0,
        );
      }

      if (toLayer) {
        gsap.set(toLayer, { autoAlpha: 1, pointerEvents: "auto" });

        // If entering cinema, configure sub-views for the target step
        if (toLayer === cinemaEl) {
          if (to === 0) {
            if (bgTwo) gsap.set(bgTwo, { opacity: 0 });
            if (copyTwo) gsap.set(copyTwo, { opacity: 0, pointerEvents: "none" });
            if (heroEl) gsap.set(heroEl, { opacity: 1, pointerEvents: "auto" });
          } else if (to === 1) {
            if (heroEl) gsap.set(heroEl, { opacity: 0, pointerEvents: "none" });
            if (bgTwo) gsap.set(bgTwo, { opacity: 1 });
            if (copyTwo) {
              gsap.set(copyTwo, { opacity: 1, pointerEvents: "auto" });
              copyTwo.classList.add("is-interactive");
            }
          }
        }

        tl.fromTo(
          toLayer,
          {
            opacity: 0,
            scale: isReduced ? 1 : isForward ? 1.02 : 0.98,
          },
          {
            opacity: 1,
            scale: 1,
            duration,
            ease,
          },
          duration * 0.1,
        );
      }
    }

    haptic(8);
  }, [clearAutoTimer]);

  const nextStep = useCallback(() => {
    if (currentStepRef.current < STAGE_STEPS.length - 1) {
      goToStep(currentStepRef.current + 1);
    }
  }, [goToStep]);

  const prevStep = useCallback(() => {
    if (currentStepRef.current > 0) {
      goToStep(currentStepRef.current - 1);
    }
  }, [goToStep]);

  // Set initial state and attach listeners
  useEffect(() => {
    const stageEl = stage.current;
    if (!enabled || !stageEl) return;

    // Initialize layers: Step 0 (Hero: Lakshay & Prerna) is active, all others hidden
    const cinemaEl = stageEl.querySelector<HTMLElement>('[data-stage-scene="cinema"]');
    const day11El = stageEl.querySelector<HTMLElement>('[data-stage-scene="day-dec-11"]');
    const day12El = stageEl.querySelector<HTMLElement>('[data-stage-scene="day-dec-12"]');
    const venueEl = stageEl.querySelector<HTMLElement>('[data-stage-scene="venue"]');
    const rsvpEl = stageEl.querySelector<HTMLElement>('[data-stage-scene="rsvp"]');

    const nonCinema = [day11El, day12El, venueEl, rsvpEl];
    nonCinema.forEach((layer) => {
      if (layer) gsap.set(layer, { autoAlpha: 0, opacity: 0, pointerEvents: "none" });
    });

    if (cinemaEl) {
      gsap.set(cinemaEl, { autoAlpha: 1, opacity: 1, pointerEvents: "auto" });
      cinemaEl.classList.add("is-current");

      const heroEl = cinemaEl.querySelector<HTMLElement>(".scene-hero");
      const bgTwo = cinemaEl.querySelector<HTMLElement>(".scene-bg--two");
      const copyTwo = cinemaEl.querySelector<HTMLElement>(".scene-copy--two");

      if (heroEl) gsap.set(heroEl, { opacity: 1, pointerEvents: "auto" });
      if (bgTwo) gsap.set(bgTwo, { opacity: 0 });
      if (copyTwo) gsap.set(copyTwo, { opacity: 0, pointerEvents: "none" });
    }

    void arriveAt("hero");

    // Gesture detection: One-Stroke touch with instant touchmove trigger
    let touchStartY = 0;
    let touchStartX = 0;
    let strokeTriggered = false;
    let isTrackingTouch = false;

    const onTouchStart = (e: TouchEvent) => {
      clearAutoTimer();
      hasAutoAdvancedRef.current = true;
      if (e.touches.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(".scratch, canvas, [data-lenis-prevent], .scene-two__scratch")) {
        return;
      }
      isTrackingTouch = true;
      strokeTriggered = false;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTrackingTouch) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(".scratch, canvas, [data-lenis-prevent], .scene-two__scratch")) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }

      if (strokeTriggered) return;

      const touch = e.touches[0];
      if (!touch) return;
      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;

      // Trigger IMMEDIATELY as soon as finger moves 20px vertically
      if (Math.abs(deltaY) > 20 && Math.abs(deltaY) > Math.abs(deltaX) * 0.55) {
        strokeTriggered = true;
        if (deltaY < 0) {
          nextStep();
        } else {
          prevStep();
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTrackingTouch) return;
      isTrackingTouch = false;
      if (strokeTriggered) return;

      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;

      // Sensitive fallback for fast tap-flicks
      if (Math.abs(deltaY) > 14 && Math.abs(deltaY) > Math.abs(deltaX) * 0.55) {
        strokeTriggered = true;
        if (deltaY < 0) {
          nextStep();
        } else {
          prevStep();
        }
      }
    };

    // Wheel event (desktop) with 280ms throttle
    let lastWheelTime = 0;
    const onWheel = (e: WheelEvent) => {
      clearAutoTimer();
      hasAutoAdvancedRef.current = true;
      const target = e.target as HTMLElement | null;
      if (target?.closest(".scratch, canvas, [data-lenis-prevent], .scene-two__scratch")) {
        return;
      }
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime < 280) return;
      if (Math.abs(e.deltaY) < 12) return;

      lastWheelTime = now;
      if (e.deltaY > 0) {
        nextStep();
      } else {
        prevStep();
      }
    };

    // Keyboard navigation
    const onKeyDown = (e: KeyboardEvent) => {
      clearAutoTimer();
      hasAutoAdvancedRef.current = true;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        nextStep();
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prevStep();
      }
    };

    // Scroll-cue click / tap handler
    const cue = stageEl.querySelector<HTMLElement>(".scroll-cue");
    const onCueClick = () => {
      clearAutoTimer();
      hasAutoAdvancedRef.current = true;
      nextStep();
    };
    if (cue) {
      cue.style.cursor = "pointer";
      cue.style.pointerEvents = "auto";
      cue.addEventListener("click", onCueClick);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearAutoTimer();
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      if (cue) cue.removeEventListener("click", onCueClick);
    };
  }, [clearAutoTimer, enabled, nextStep, prevStep, stage]);

  return {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
  };
}
