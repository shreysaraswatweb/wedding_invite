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
import video3 from "../../assests/wedding_invite_assests/3.mp4";
import video4 from "../../assests/wedding_invite_assests/4.mp4";
import video5 from "../../assests/wedding_invite_assests/5.mp4";
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
        {/* Page 1 (Lakshay & Prerna - Video 1): 19s forward -> 16.92s<->19s Boomerang loop */}
        <div className="scene-bg scene-bg--one">
          <SeamlessVideoBackground
            src={video1}
            active={active}
            boomerangStart={16.92}
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
        {/* Page 4 (Video 3): 3.mp4 background */}
        <div className="scene-bg scene-bg--three">
          <SeamlessVideoBackground
            src={video3}
            active={active}
            crossfadeDuration={1.4}
          />
        </div>
        {/* Page 5 (Video 4): 4.mp4 background */}
        <div className="scene-bg scene-bg--four">
          <SeamlessVideoBackground
            src={video4}
            active={active}
            crossfadeDuration={1.4}
          />
        </div>
        {/* Page 6 (Video 5): 5.mp4 background */}
        <div className="scene-bg scene-bg--five">
          <SeamlessVideoBackground
            src={video5}
            active={active}
            crossfadeDuration={1.4}
          />
        </div>

        {/* All of this scene's text: faded out by the stage as the next scene arrives. */}
        <div className="cinema__copy" data-stage-copy>
          {/* Top-Center Hero: Logo, Bride & Groom Names, "ARE GETTING MARRIED" */}
          <div className="scene-hero" aria-labelledby="scene-hero-title">
            <img
              className="scene-logo"
              src={invitation.logo}
              alt="VS monogram with peacocks"
            />
            <h1 id="scene-hero-title" className="scene-hero__names">
              <span className="scene-hero__name scene-hero__name--first">{invitation.coupleNames.first}</span>
              <span className="scene-hero__amp">&amp;</span>
              <span className="scene-hero__name scene-hero__name--second">{invitation.coupleNames.second}</span>
            </h1>
            <p className="scene-hero__married">
              {invitation.coupleNames.invitationLine}
            </p>
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

          {/* Page 4: Haldi Ceremony with 3.mp4 background */}
          <div
            className="scene-copy scene-copy--three"
            aria-label="Haldi Ceremony Invitation"
          >
            <div className="scene-haldi">
              <h2 className="scene-haldi__title">Haldi</h2>

              <p className="scene-haldi__date">31st December, 2026</p>

              <img
                className="scene-haldi__divider"
                src="/images/haldi-divider.png"
                alt=""
                aria-hidden="true"
              />

              <p className="scene-haldi__day">
                <span>THURSDAY</span>
                <span>AT</span>
              </p>

              <address className="scene-haldi__venue">
                <span>SHRI NILESH NACHANKAR, 88,</span>
                <span>SHIVKRUPA NIWAS, INDIRA DEVI TOWN,</span>
                <span>WATHODA LAYOUT, NAGPUR</span>
              </address>

              <p className="scene-haldi__time">7:30 PM ONWARDS</p>

              <a
                className="scene-haldi__directions"
                href="https://maps.app.goo.gl/BYWBTCGawCotxKJ86"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get direction to Haldi ceremony venue on Google Maps (opens in a new tab)"
              >
                <svg
                  className="scene-haldi__directions-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="currentColor"
                  />
                </svg>
                <span>Get Direction</span>
              </a>
            </div>
          </div>

          {/* Page 5: Ceremony 4 with 4.mp4 background */}
          <div
            className="scene-copy scene-copy--four"
            aria-label="Wedding Celebration"
          >
            {/* Copy container for 4.mp4 */}
          </div>

          {/* Page 6: Ceremony 5 with 5.mp4 background */}
          <div
            className="scene-copy scene-copy--five"
            aria-label="Wedding Ceremony"
          >
            {/* Copy container for 5.mp4 */}
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
