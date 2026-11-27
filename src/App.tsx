import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CinematicSequence } from "./components/CinematicSequence/CinematicSequence";
import { Stage } from "./components/Stage/Stage";
import { Programmes } from "./components/Programmes/Programmes";
import { WarmRegards } from "./components/WarmRegards/WarmRegards";
import { invitation } from "./config/invitation";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import {
  destroySmoothScroll,
  getLenis,
  initSmoothScroll,
  smoothScrollTo,
} from "./utils/smoothScroll";

/** The invitation always opens on the first cinematic section, not a restored scroll. */
function pinToFirstScene() {
  smoothScrollTo(0, { immediate: true });
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const songRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const userMutedRef = useRef(false);

  // Initialize Lenis inertial smooth scrolling
  useEffect(() => {
    const lenis = initSmoothScroll();
    lenis.stop();

    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        ScrollTrigger.refresh();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      destroySmoothScroll();
    };
  }, []);

  const seekToStart = () => {
    const audio = songRef.current;
    if (!audio) return;
    const startAt = invitation.song.startSeconds;
    if (audio.currentTime < 1) {
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        audio.currentTime = startAt;
      } else {
        const onMetadata = () => {
          if (audio.currentTime < 1) {
            audio.currentTime = startAt;
          }
        };
        audio.addEventListener("loadedmetadata", onMetadata, { once: true });
        audio.addEventListener("canplay", onMetadata, { once: true });
      }
    }
  };

  const playWithSound = () => {
    const audio = songRef.current;
    if (!audio) return;

    audio.muted = false;
    seekToStart();

    audio
      .play()
      .then(() => {
        setMuted(false);
      })
      .catch(() => {
        // Autoplay blocked by browser policy until interaction
        audio.muted = true;
        setMuted(true);
      });
  };

  const toggleMute = () => {
    const audio = songRef.current;
    if (!audio) return;

    if (!muted) {
      // User is explicitly muting
      userMutedRef.current = true;
      audio.muted = true;
      audio.pause();
      setMuted(true);
    } else {
      // User is explicitly unmuting
      userMutedRef.current = false;
      audio.muted = false;
      seekToStart();
      audio
        .play()
        .then(() => {
          setMuted(false);
        })
        .catch(() => {
          audio.muted = true;
          setMuted(true);
        });
    }
  };

  // Sync state with native audio element events
  useEffect(() => {
    const audio = songRef.current;
    if (!audio) return;

    const onPlay = () => setMuted(false);
    const onPause = () => {
      if (userMutedRef.current || audio.paused) {
        setMuted(true);
      }
    };
    const onVolumeChange = () => {
      setMuted(audio.muted || audio.paused);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("volumechange", onVolumeChange);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  const handleSongEnded = () => {
    const audio = songRef.current;
    if (!audio) return;
    const startAt = invitation.song.startSeconds;
    audio.currentTime = startAt;
    if (!userMutedRef.current) {
      audio.play().catch(() => {
        audio.currentTime = 0;
        void audio.play();
      });
    }
  };

  // Autoplay attempt + seamless first-user-gesture fallback
  useEffect(() => {
    const audio = songRef.current;
    if (!audio) return;

    // Try autoplaying with sound on load
    playWithSound();

    // Unlock on the first user interaction if browser blocked autoplay
    const unlockOnGesture = (e: Event) => {
      // If the interaction happened on the sound toggle itself, toggleMute handles it
      const target = e.target as HTMLElement | null;
      if (target?.closest(".sound-toggle")) {
        cleanup();
        return;
      }

      if (!userMutedRef.current && (audio.paused || audio.muted)) {
        playWithSound();
      }
      cleanup();
    };

    const gestureEvents = ["click", "pointerdown", "touchstart", "touchend", "keydown", "wheel"];
    const cleanup = () => {
      gestureEvents.forEach((ev) => {
        window.removeEventListener(ev, unlockOnGesture);
        document.removeEventListener(ev, unlockOnGesture);
      });
    };

    gestureEvents.forEach((ev) => {
      window.addEventListener(ev, unlockOnGesture, { passive: true });
      document.addEventListener(ev, unlockOnGesture, { passive: true });
    });

    return () => {
      cleanup();
    };
  }, []);

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    pinToFirstScene();
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#181c20");
  }, []);

  return (
    <main>
      <audio
        ref={songRef}
        src={invitation.song.src}
        preload="auto"
        onEnded={handleSongEnded}
      />
      <button
        type="button"
        className={`sound-toggle ${muted ? "is-muted" : "is-playing"}`}
        aria-pressed={!muted}
        aria-label={muted ? "Play music" : "Mute music"}
        onClick={toggleMute}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h3.2L12 6.2v11.6L7.2 14H4z" fill="currentColor" />
          {muted ? (
            <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <>
              <path d="M15.2 9.2a3.6 3.6 0 0 1 0 5.6" strokeWidth="1.8" />
              <path d="M17.6 7a6.6 6.6 0 0 1 0 10" strokeWidth="1.8" />
            </>
          )}
        </svg>
      </button>

      {/* One fixed-viewport stage: every scene crossfades into the next as the guest scrolls. */}
      <Stage
        stageRef={stageRef}
        active={true}
        settled={true}
        reducedMotion={reducedMotion}
      >
        <CinematicSequence
          active={true}
          settled={true}
          reducedMotion={reducedMotion}
          stage={stageRef}
        />
        <Programmes active={true} reducedMotion={reducedMotion} stage={stageRef} />
        <WarmRegards active={true} reducedMotion={reducedMotion} stage={stageRef} />
      </Stage>
    </main>
  );
}
