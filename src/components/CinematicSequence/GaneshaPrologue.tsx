import { useEffect, useState } from "react";
import "./GaneshaPrologue.css";

type GaneshaPrologueProps = {
  active: boolean;
  videoRendered?: boolean;
  onComplete?: () => void;
};

export function GaneshaPrologue({
  active,
  videoRendered = false,
  onComplete,
}: GaneshaPrologueProps) {
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!active) return;

    let fadeTimer: number;
    let removeTimer: number;

    const startTimer = () => {
      // Hold video paused on frame 0 for 2 seconds, then trigger fade-blur out and unpause video
      fadeTimer = window.setTimeout(() => {
        setFading(true);
        onComplete?.();
      }, 2000);

      removeTimer = window.setTimeout(() => {
        setRemoved(true);
      }, 2800);
    };

    if (videoRendered) {
      startTimer();
    } else {
      const fallback = window.setTimeout(startTimer, 250);
      return () => {
        clearTimeout(fallback);
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [active, videoRendered, onComplete]);

  const handleDismiss = () => {
    if (fading) return;
    setFading(true);
    onComplete?.();
    window.setTimeout(() => {
      setRemoved(true);
    }, 800);
  };

  if (!active || removed) return null;

  return (
    <div
      className={`ganesha-prologue ${fading ? "is-fading" : ""}`}
      onClick={handleDismiss}
      role="banner"
      aria-label="Shree Ganeshaya Namah Blessing"
    >
      <div className="ganesha-prologue__card">
        {/* Top: Shree Ganeshaya Namah with authentic two-tone saffron & vermillion styling */}
        <h2 className="ganesha-prologue__heading">
          <span className="ganesha-prologue__danda" aria-hidden="true">•॥</span>
          <span className="ganesha-prologue__word ganesha-prologue__word--shree">श्री</span>
          <span className="ganesha-prologue__word ganesha-prologue__word--ganeshaya">गणेशाय</span>
          <span className="ganesha-prologue__word ganesha-prologue__word--namah">नमः</span>
          <span className="ganesha-prologue__danda" aria-hidden="true">॥•</span>
        </h2>

        {/* Center: Divine Ganeshji Artwork */}
        <div className="ganesha-prologue__art-wrap">
          <div className="ganesha-prologue__aura" aria-hidden="true" />
          <img
            src="/images/ganeshji.png"
            alt="Lord Ganesha"
            className="ganesha-prologue__art"
            loading="eager"
            decoding="sync"
          />
        </div>

        {/* Bottom: Vakratunda Mahakaya Shloka with authentic wedding calligraphy */}
        <div className="ganesha-prologue__shloka">
          <p className="ganesha-prologue__shloka-line">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभः
          </p>
          <p className="ganesha-prologue__shloka-line">
            निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा
          </p>
        </div>
      </div>
    </div>
  );
}
