import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { onArrival } from "../../stage/arrival";
import cardBg from "../../assests/wedding_invite_assests/2.jpg";
import peacockLogo from "/images/vs-peacock-logo.png";
import namasteLotus from "/images/namaste-lotus.png";
import "./WarmRegards.css";

type WarmRegardsProps = {
  active: boolean;
  reducedMotion: boolean;
  stage: RefObject<HTMLElement | null>;
};

export function WarmRegards({ active, reducedMotion }: WarmRegardsProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const crest = q(".warm-regards__crest");
      const message = q(".warm-regards__message");
      const subhead = q(".warm-regards__subhead");
      const family = q(".warm-regards__family");
      const lotus = q(".warm-regards__lotus");

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

      tl.fromTo(crest, { opacity: 0, y: 16, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.75 }, 0)
        .fromTo(message, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, "+=0.15")
        .fromTo(subhead, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.65 }, "+=0.15")
        .fromTo(family, { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.75 }, "+=0.12")
        .fromTo(lotus, { opacity: 0, y: 16, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "+=0.15");

      const unsub = onArrival("warm-regards", () => {
        tl.restart();
      });

      return () => {
        tl.kill();
        unsub();
      };
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      className="warm-regards stage__layer"
      data-stage-scene="warm-regards"
      aria-label="With Warm Regards - The Nachankar Family"
      aria-hidden={!active}
      inert={!active}
    >
      <div
        className="warm-regards__backdrop"
        style={{ backgroundImage: `url(${cardBg})` }}
      />
      <div className="warm-regards__veil" />

      <div className="warm-regards__inner" data-stage-copy>
        <header className="warm-regards__header">
          <img
            className="warm-regards__crest"
            src={peacockLogo}
            alt="Royal Peacock Crest"
            aria-hidden="true"
          />
        </header>

        <div className="warm-regards__body">
          <h2 className="warm-regards__message">
            <span>YOUR PRESENCE MADE</span>
            <span>OUR CELEBRATION</span>
            <span>MORE SPECIAL</span>
          </h2>

          <p className="warm-regards__subhead">WITH WARM REGARDS</p>

          <p className="warm-regards__family">The Nachankar Family</p>
        </div>

        <footer className="warm-regards__footer">
          <img
            className="warm-regards__lotus"
            src={namasteLotus}
            alt="Pranam Namaste Lotus"
            aria-hidden="true"
          />
        </footer>
      </div>
    </section>
  );
}
