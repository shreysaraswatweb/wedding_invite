import { useCallback, useRef, useState, type CSSProperties, type RefObject } from "react";
import { invitation } from "../../config/invitation";
import { haptic } from "../../utils/haptic";
import { useSceneScroll } from "../../animations/useSceneScroll";
import { Countdown } from "../Countdown/Countdown";
import { OrnamentDivider } from "../OrnamentDivider/OrnamentDivider";
import { ScratchCard } from "../ScratchCard/ScratchCard";
import { SeamlessVideoBackground } from "./SeamlessVideoBackground";
import countdownVideo from "../../assests/videos/gemini_generated_video_15ad4f22.mp4";
import video1 from "../../assests/wedding_invite_assests/1.mp4";
import image2 from "../../assests/wedding_invite_assests/2.jpg";
import "./CinematicSequence.css";

function CopyableDates({ label, dateTime }: { label: string; dateTime: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      haptic(10);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard can be denied; the dates remain visible. */
    }
  };

  return (
    <button
      type="button"
      className="scene-two__dates-btn"
      onClick={copy}
      aria-label={copied ? "Dates copied" : `Copy the wedding dates, ${label}`}
    >
      <time className="scene-two__dates" dateTime={dateTime}>
        {copied ? "Copied" : label}
      </time>
    </button>
  );
}

type CinematicSequenceProps = {
  active: boolean;
  /** The stage is active and ready in front of the guest. */
  settled: boolean;
  reducedMotion: boolean;
  /** The fixed stage this scene is a layer of. */
  stage: RefObject<HTMLElement | null>;
};

export function CinematicSequence({
  active,
  settled,
  reducedMotion,
  stage,
}: CinematicSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [videoRendered, setVideoRendered] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [, sceneTwo, ...later] = invitation.scenes;
  const { wedding } = invitation;
  const framed = Boolean(sceneTwo.artAspect);
  // "Countdown to Forever" → main word, a small linking word ("to"), and the rest.
  const [headingMain, ...headingWords] = sceneTwo.title.split(" ");
  const headingLink = headingWords.length > 1 && headingWords[0].length <= 3 ? headingWords[0] : "";
  const headingRest = (headingLink ? headingWords.slice(1) : headingWords).join(" ");
  const frameStyle = { "--art-aspect": sceneTwo.artAspect ?? 1 } as CSSProperties;

  const handleVideoRendered = useCallback(() => {
    setVideoRendered(true);
  }, []);

  const handleVideoCompleted = useCallback(() => {
    setVideoCompleted(true);
  }, []);

  useSceneScroll({
    root: rootRef,
    stage,
    enabled: active,
    settled,
    reducedMotion,
    videoRendered,
    videoCompleted,
  });

  return (
    <section
      ref={rootRef}
      className={`cinema stage__layer ${active ? "is-active" : ""}`}
      data-stage-scene="cinema"
      aria-label="Wedding title sequence"
      aria-hidden={!active}
      inert={!active}
    >
      <div className="cinema__viewport">
        {/* Page 1 (Lakshay & Prerna - Video 1): 19s forward -> 16s<->19s Boomerang loop */}
        <div className="scene-bg scene-bg--one">
          <SeamlessVideoBackground
            src={video1}
            active={active}
            boomerangStart={16.0}
            boomerangEnd={19.0}
            onInitialComplete={handleVideoCompleted}
            onVideoRendered={handleVideoRendered}
          />
        </div>
        {/* Page 2 (Wedding Invitation): 2.jpg background */}
        <div className="scene-bg scene-bg--card">
          <img
            src={image2}
            alt="Invitation background"
            className="scene-bg__image"
            loading="eager"
          />
        </div>
        {/* Page 3 (Countdown & Scratch): Seamless looping video background */}
        <div className="scene-bg scene-bg--two">
          <SeamlessVideoBackground
            src={countdownVideo}
            active={active}
            crossfadeDuration={1.4}
          />
        </div>

        {/* All of this scene's text: faded out by the stage as the next scene arrives. */}
        <div className="cinema__copy" data-stage-copy>
          {/* Top-Center Hero: Logo Reveal, Bride & Groom Names, "Together with their families..." (Page 1) */}
          <div className="scene-hero" aria-labelledby="scene-hero-title">
            <img
              className="scene-logo"
              src={invitation.logo}
              alt="LP monogram"
            />
            <h1 id="scene-hero-title" className="scene-names__title">
              <span className="scene-names__name">{invitation.coupleNames.first}</span>
              <span className="scene-names__amp">&amp;</span>
              <span className="scene-names__name">{invitation.coupleNames.second}</span>
            </h1>
            <p className="scene-hero__married">{invitation.coupleNames.invitationLine}</p>
          </div>

          {/* Formal Wedding Invitation Card (Page 2) */}
          <div className="scene-formal-card" aria-label="Formal Wedding Invitation">
            <p className="scene-formal-card__blessing">
              With Divine blessings and the love of our elders, we warmly invite you to grace the wedding ceremony of our children
            </p>

            <div className="scene-formal-card__couple">
              <div className="scene-formal-card__person">
                <h2 className="scene-formal-card__name">Paramveer</h2>
                <p className="scene-formal-card__parents">
                  <span>S/o Mrs. Prem Lata Yadav &amp;</span>
                  <span>Mr. Girish Kumar</span>
                </p>
              </div>

              <div className="scene-formal-card__person">
                <h2 className="scene-formal-card__name">Barkha</h2>
                <p className="scene-formal-card__parents">
                  <span>D/o Mrs. Sunita Jain &amp;</span>
                  <span>Mr. Anand Jain</span>
                </p>
              </div>
            </div>
          </div>

          <div
            className={`scene-copy scene-copy--two ${framed ? "scene-copy--framed" : ""}`.trim()}
            style={framed ? frameStyle : undefined}
          >
            <div className="scene-two__inner">
              {/* Above the centre: invitation line and the scratch-to-reveal dates. */}
              <div className="scene-two__lead">
                {sceneTwo.kicker ? <p className="scene-kicker">{sceneTwo.kicker}</p> : null}
                {/* Typographic lockup: "COUNTDOWN" in spaced capitals over an italic "to Forever". */}
                <h2 className="scene-title scene-title--second scene-two__heading">
                  <span className="scene-two__heading-main">{headingMain}</span>{" "}
                  <span className="scene-two__heading-tail">
                    {headingLink ? <span className="scene-two__heading-link">{headingLink}</span> : null}
                    {headingLink ? " " : null}
                    {headingRest}
                  </span>
                </h2>
                {sceneTwo.supportingText ? <p className="scene-support">{sceneTwo.supportingText}</p> : null}
                <OrnamentDivider className="scene-two__divider" />
                <ScratchCard
                  className="scene-two__scratch"
                  prompt={wedding.scratchLabel}
                  revealLabel={`${wedding.scratchLabel}: reveal the wedding dates`}
                  announcement={`The wedding is on ${wedding.datesLabel}.`}
                  reducedMotion={reducedMotion}
                >
                  <CopyableDates label={wedding.datesLabel} dateTime={wedding.startsAt} />
                </ScratchCard>
              </div>
              {/* The centre of the screen: the countdown, highlighted. */}
              <div className="scene-two__countdown-panel">
                <Countdown
                  className="scene-two__countdown"
                  target={wedding.startsAt}
                  completeMessage={wedding.celebrationMessage}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extension point: later cinematic chapters are declared in invitation.scenes */}
      {later.length > 0 ? (
        <ol className="cinema__later sr-only">
          {later.map((scene) => (
            <li key={scene.id}>{scene.title}</li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
