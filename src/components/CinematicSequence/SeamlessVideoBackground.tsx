import { useEffect, useRef } from "react";
import "./SeamlessVideoBackground.css";

type SeamlessVideoBackgroundProps = {
  src: string;
  active?: boolean;
  crossfadeDuration?: number; // Duration of crossfade blend in seconds (default: 0 = single native loop)
  className?: string;
  onVideoRendered?: () => void;
  /** Start timestamp in seconds for boomerang loop (e.g. 16.9.0) */
  boomerangStart?: number;
  /** End timestamp in seconds for boomerang loop (e.g. 19.0) */
  boomerangEnd?: number;
  /** Callback fired the first time the full video completes its full duration */
  onInitialComplete?: () => void;
};

/**
 * High-definition video background.
 * - Supports Boomerang Loop: plays 0s -> 19s, then boomerangs 19s -> 16.9s -> 19s -> 16.9s continuously.
 * - Supports Dual-player A/B crossfading for clips requiring seamless loop crossfades.
 * - Supports Single hardware-accelerated stream with native loop.
 */
export function SeamlessVideoBackground({
  src,
  active = true,
  crossfadeDuration = 0,
  className = "",
  onVideoRendered,
  boomerangStart,
  boomerangEnd,
  onInitialComplete,
}: SeamlessVideoBackgroundProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onRenderedRef = useRef(onVideoRendered);
  const onInitialCompleteRef = useRef(onInitialComplete);
  useEffect(() => {
    onRenderedRef.current = onVideoRendered;
    onInitialCompleteRef.current = onInitialComplete;
  });

  const isBoomerang = boomerangStart !== undefined && boomerangEnd !== undefined;
  const isDual = !isBoomerang && crossfadeDuration > 0;

  // -------------------------------------------------------------
  // BOOMERANG MODE: 0s -> 19s, then 19s <-> 16.9s infinite boomerang
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isBoomerang) return;
    const vid = videoARef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas) return;

    let animId = 0;
    let hasCompletedFirstRun = false;
    let isBoomerangRunning = false;
    const frames: ImageBitmap[] = [];
    let frameSeq = 0;
    let renderedNotified = false;

    const bStart = boomerangStart ?? 16.92;
    const bEnd = boomerangEnd ?? 19;

    // Video always stays at full opacity (never flashes black)
    vid.style.opacity = "1";
    canvas.style.display = "none";

    const notifyRendered = () => {
      if (!renderedNotified) {
        renderedNotified = true;
        onRenderedRef.current?.();
      }
    };

    if (vid.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      notifyRendered();
    } else {
      vid.addEventListener("loadeddata", notifyRendered, { once: true });
      vid.addEventListener("canplay", notifyRendered, { once: true });
    }

    if (active) {
      vid.currentTime = 0;
      vid.play().then(() => notifyRendered()).catch(() => {});
    } else {
      vid.pause();
    }

    const startBoomerangLoop = () => {
      if (isBoomerangRunning) return;
      isBoomerangRunning = true;

      const activeFrames = frames.filter(Boolean);
      const ctx = canvas.getContext("2d");
      if (!ctx || activeFrames.length < 5) {
        // Fallback: continuous video loop between 16.9.9s and 19s without blanking screen
        const onFallbackTimeUpdate = () => {
          if (!active) return;
          if (vid.currentTime >= bEnd) {
            vid.currentTime = bStart;
            vid.play().catch(() => {});
          }
        };
        vid.currentTime = bStart;
        vid.play().catch(() => {});
        vid.addEventListener("timeupdate", onFallbackTimeUpdate);
        return;
      }

      // Draw last frame immediately so canvas has image before being displayed
      canvas.width = vid.videoWidth || 720;
      canvas.height = vid.videoHeight || 1280;
      const lastBmp = activeFrames[activeFrames.length - 1];
      if (lastBmp) {
        ctx.drawImage(lastBmp, 0, 0, canvas.width, canvas.height);
      }

      // Display canvas layered smoothly over the video
      canvas.style.display = "block";

      let frameIdx = activeFrames.length - 1;
      let dir = -1; // Reverse first: 19s -> 16.9s
      let lastTime = performance.now();
      const targetInterval = 1000 / 30; // 30 fps

      const boomerangTick = (now: number) => {
        if (!active) {
          animId = requestAnimationFrame(boomerangTick);
          return;
        }

        if (now - lastTime >= targetInterval) {
          lastTime = now;
          const bmp = activeFrames[frameIdx];
          if (bmp) {
            ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
          }

          frameIdx += dir;
          if (frameIdx <= 0) {
            frameIdx = 0;
            dir = 1; // 16.9s -> 19s (forward)
          } else if (frameIdx >= activeFrames.length - 1) {
            frameIdx = activeFrames.length - 1;
            dir = -1; // 19s -> 16.9s (reverse)
          }
        }

        animId = requestAnimationFrame(boomerangTick);
      };

      animId = requestAnimationFrame(boomerangTick);
    };

    const handleFirstRunComplete = () => {
      if (hasCompletedFirstRun) return;
      hasCompletedFirstRun = true;

      // Pause the forward video
      vid.pause();

      // Trigger the choreographed Logo & Names reveal!
      onInitialCompleteRef.current?.();

      // Give 100ms for in-flight frame promises to resolve into the array, then launch boomerang
      window.setTimeout(() => {
        startBoomerangLoop();
      }, 100);
    };

    // Frame capture during forward playback between 16.9s and 19s
    let lastCaptureTime = 0;
    const captureLoop = () => {
      if (hasCompletedFirstRun) return;

      const t = vid.currentTime;

      if (t >= bStart && t <= bEnd) {
        const now = performance.now();
        if (now - lastCaptureTime >= 30) {
          lastCaptureTime = now;
          if ("createImageBitmap" in window) {
            const currentSeq = frameSeq++;
            createImageBitmap(vid)
              .then((bmp) => {
                // Collect frames for the reverse boomerang
                frames[currentSeq] = bmp;
              })
              .catch(() => {});
          }
        }
      }

      if (t >= bEnd || vid.ended) {
        handleFirstRunComplete();
        return;
      }

      if ("requestVideoFrameCallback" in vid) {
        (vid as any).requestVideoFrameCallback(captureLoop);
      } else {
        animId = requestAnimationFrame(captureLoop);
      }
    };

    if ("requestVideoFrameCallback" in vid) {
      (vid as any).requestVideoFrameCallback(captureLoop);
    } else {
      animId = requestAnimationFrame(captureLoop);
    }

    const onTimeUpdate = () => {
      if (hasCompletedFirstRun) return;
      if (vid.currentTime >= bEnd) {
        handleFirstRunComplete();
      }
    };
    vid.addEventListener("timeupdate", onTimeUpdate);
    vid.addEventListener("ended", handleFirstRunComplete);

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (!hasCompletedFirstRun) vid.pause();
      } else if (active) {
        if (!hasCompletedFirstRun) vid.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      vid.removeEventListener("timeupdate", onTimeUpdate);
      vid.removeEventListener("ended", handleFirstRunComplete);
      vid.pause();
      frames.filter(Boolean).forEach((bmp) => bmp.close());
    };
  }, [active, isBoomerang, boomerangStart, boomerangEnd]);

  // -------------------------------------------------------------
  // STANDARD PLAYBACK MODE (Single Player or Dual A/B Crossfade)
  // -------------------------------------------------------------
  useEffect(() => {
    if (isBoomerang) return;
    const vidA = videoARef.current;
    if (!vidA) return;

    let renderedNotified = false;
    const notifyRendered = () => {
      if (!renderedNotified) {
        renderedNotified = true;
        onRenderedRef.current?.();
      }
    };

    if (vidA.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      notifyRendered();
    } else {
      vidA.addEventListener("loadeddata", notifyRendered, { once: true });
      vidA.addEventListener("canplay", notifyRendered, { once: true });
    }

    if (!isDual) {
      vidA.style.opacity = "1";
      if (active) {
        vidA.play().then(() => notifyRendered()).catch(() => {});
      } else {
        vidA.pause();
      }

      const onVisibilityChange = () => {
        if (document.hidden) {
          vidA.pause();
        } else if (active) {
          vidA.play().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        vidA.pause();
      };
    }

    const vidB = videoBRef.current;
    if (!vidB) return;

    vidA.style.opacity = "1";
    vidB.style.opacity = "0";

    let primaryIndex = 0;
    let isCrossfading = false;
    let animId = 0;

    const playPrimary = () => {
      const primary = primaryIndex === 0 ? vidA : vidB;
      primary.play().then(() => notifyRendered()).catch(() => {});
    };

    if (active) {
      playPrimary();
    } else {
      vidA.pause();
      vidB.pause();
    }

    const tick = () => {
      if (!active) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const primary = primaryIndex === 0 ? vidA : vidB;
      const secondary = primaryIndex === 0 ? vidB : vidA;

      if (!isNaN(primary.duration) && primary.duration > 0) {
        const timeRemaining = primary.duration - primary.currentTime;

        if (timeRemaining <= crossfadeDuration && timeRemaining > 0) {
          if (!isCrossfading) {
            isCrossfading = true;
            secondary.currentTime = 0;
            secondary.play().catch(() => {});
          }

          const elapsed = crossfadeDuration - timeRemaining;
          const linear = Math.min(1, Math.max(0, elapsed / crossfadeDuration));
          const blend = (1 - Math.cos(linear * Math.PI)) / 2;

          primary.style.opacity = String(1 - blend);
          secondary.style.opacity = String(blend);
        } else if (timeRemaining <= 0.08 || primary.ended) {
          if (!isCrossfading) {
            secondary.currentTime = 0;
            secondary.play().catch(() => {});
          }
          primary.pause();
          primary.currentTime = 0;
          primary.style.opacity = "0";
          secondary.style.opacity = "1";

          primaryIndex = primaryIndex === 0 ? 1 : 0;
          isCrossfading = false;
        } else if (!isCrossfading) {
          primary.style.opacity = "1";
          secondary.style.opacity = "0";
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      if (document.hidden) {
        vidA.pause();
        vidB.pause();
      } else if (active) {
        const primary = primaryIndex === 0 ? vidA : vidB;
        primary.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      vidA.pause();
      vidB.pause();
    };
  }, [active, crossfadeDuration, isBoomerang, isDual, src]);

  return (
    <div className={`seamless-video ${className}`.trim()} aria-hidden="true">
      <video
        ref={videoARef}
        src={src}
        muted
        loop={!isDual && !isBoomerang}
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        className="seamless-video__media"
      />
      {isDual && (
        <video
          ref={videoBRef}
          src={src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="seamless-video__media"
        />
      )}
      {isBoomerang && (
        <canvas
          ref={canvasRef}
          className="seamless-video__canvas"
        />
      )}
    </div>
  );
}
