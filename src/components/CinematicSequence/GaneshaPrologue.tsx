import { useEffect, useState } from "react";
import "./GaneshaPrologue.css";

type GaneshaPrologueProps = {
  active: boolean;
  onComplete: () => void;
};

export function GaneshaPrologue({ active, onComplete }: GaneshaPrologueProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Display for 3.4 seconds, then smoothly fade out
    const fadeTimer = window.setTimeout(() => {
      setFading(true);
    }, 3400);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [active, onComplete]);

  const handleDismiss = () => {
    if (fading) return;
    setFading(true);
    window.setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div
      className={`ganesha-prologue ${fading ? "is-fading" : ""}`}
      onClick={handleDismiss}
      role="banner"
      aria-label="Shree Ganeshaya Namah Blessing"
    >
      <div className="ganesha-prologue__backdrop" aria-hidden="true">
        <img
          src="/images/ganesh-wallpaper.jpg"
          alt=""
          className="ganesha-prologue__wallpaper"
          loading="eager"
        />
        <div className="ganesha-prologue__vignette" />
      </div>

      <div className="ganesha-prologue__card">
        {/* Top: Shree Ganeshaya Namah */}
        <h2 className="ganesha-prologue__heading">
          <span className="ganesha-prologue__danda" aria-hidden="true">॥</span>
          <span className="ganesha-prologue__title">श्री गणेशाय नमः</span>
          <span className="ganesha-prologue__danda" aria-hidden="true">॥</span>
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

        {/* Bottom: Vakratunda Mahakaya Shloka */}
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
