export type CoupleAnchor = {
  /** Horizontal placement of the couple's left edge, as a percentage of the viewport. */
  x: number;
  /** Vertical placement of the couple's bottom edge, as a percentage of the viewport height. */
  y: number;
  /** Height of the couple figure, as a percentage of the viewport height. */
  height: number;
  mobile: {
    x: number;
    y: number;
    height: number;
  };
};

export type SceneConfig = {
  id: string;
  background: string;
  kicker?: string;
  title: string;
  supportingText?: string;
  /**
   * Portrait artwork shown whole in height (centred, with a soft surround on wider
   * screens) instead of cropped to cover. Width ÷ height.
   */
  artAspect?: number;
  /** Small pre-blurred copy of `background` for that surround. */
  surround?: string;
  /** Optional lettering image shown in place of the title text (the title stays as its alt text). */
  titleImage?: string;
  couple: CoupleAnchor;
  /** When, in the shared 0–1 scroll progress, this scene's copy is fully readable. */
  textAt: number;
};

export type ProgrammeEvent = {
  id: string;
  label: string;
  /** Display time, exactly as printed on the invitation. */
  time: string;
  /** Machine-readable 24h time for the <time> element. */
  dateTime: string;
};

/** The open area of an artwork that holds the copy, as % insets of the artwork. */
export type ArtCopyArea = { top: number; right: number; bottom: number; left: number };

export type ProgrammeDayConfig = {
  /** Stable id, used for keys and accessible heading ids. */
  id: string;
  /** The day's date, shown as the section's display title, e.g. "11 December". */
  date: string;
  /** Optional small-capitals line above the date; defaults to `programmes.kicker`. */
  kicker?: string;
  /** Optional per-day reveal thresholds; defaults to `motion.programmeRevealAt`. */
  revealAt?: number[];
  /** Optional per-day artwork; defaults to `programmes.background` / `artAspect` / `copyArea`. */
  background?: string;
  /** Small pre-blurred copy of `background` for the wide-screen surround (cheap to render). */
  surround?: string;
  /** Artwork width ÷ height. */
  artAspect?: number;
  copyArea?: ArtCopyArea;
  events: ProgrammeEvent[];
};

export type VenueConfig = {
  /** Small capitals line above the venue name. */
  heading: string;
  name: string;
  address: string;
  /** Soft illustrated backdrop for the section. */
  background: string;
  /**
   * What Google Maps is asked to find. Uses the supplied name and address verbatim:
   * no coordinates are hard-coded, so Google resolves the listing itself.
   */
  mapQuery: string;
  /** Still of the venue on Google Maps, shown in the map frame. */
  mapImage: string;
};

export type RsvpConfig = {
  heading: string;
  hosts: string;
  /** Closing line of the invitation, with a paw beside the name. */
  closing: string;
  closingFrom: string;
  background: string;
};

export type InvitationConfig = {
  card: {
    cover: string;
    liner: string;
    prompt: string;
    skipLabel: string;
    /** Names printed on the card that rises from the envelope. */
    names: string;
    titleImage: string;
    /** Gold wax seal on the envelope's front pocket. */
    sealImage: string;
  };
  seal: {
    letters: [string, string];
    ariaLabel: string;
  };
  /** Realistic photo of the couple: shown only in the names scene. */
  couplePhoto: string;
  /** The names scene that follows the opening title. */
  coupleNames: {
    first: string;
    second: string;
    invitationLine: string;
  };
  logo: string;
  /** Plays as soon as the guest opens the invitation. */
  song: {
    src: string;
    /** Playback begins here, in seconds. */
    startSeconds: number;
  };
  /** The single source of truth for the wedding countdown. */
  wedding: {
    /**
     * ISO 8601 instant with an explicit IST offset (+05:30), so it is the same moment
     * for every guest, wherever they are. India has no daylight saving, so a fixed
     * offset is exact for Asia/Kolkata.
     */
    startsAt: string;
    /** IANA zone of the venue, used when displaying dates. */
    timeZone: string;
    /** Replaces the countdown once the date has arrived. */
    celebrationMessage: string;
    /** Revealed under the scratch card in the second scene. */
    datesLabel: string;
    /** Printed on the scratch card's foil. */
    scratchLabel: string;
  };
  motion: {
    /**
     * Scroll distance of the opening film: title → names & couple → "Countdown to Forever".
     * The values below are shares (0–1) of this distance.
     */
    scrollDistanceVh: number;
    titleFadeStart: number;
    titleFadeEnd: number;
    /** Names scene: fades in from namesStart; fades out from namesEnd. Same background. */
    namesStart: number;
    namesEnd: number;
    logoFadeEnd: number;
    backgroundCrossfadeStart: number;
    backgroundCrossfadeEnd: number;
    sceneTwoTextStart: number;
    openingDurationMs: number;
    /** Viewport-heights of pinned scroll while the programme reveals its events. */
    programmeScrollVh: number;
    /** Scroll distance (in viewport heights ×100) of each crossfade between two scenes. */
    sceneTransitionVh: number;
    /** Scroll distance held on the venue scene once it has faded in. */
    venueHoldVh: number;
    /** Scroll distance held on the closing RSVP scene. */
    rsvpHoldVh: number;
    /** Pinned-scroll progress (0–1) at which each programme event is revealed, in order. */
    programmeRevealAt: number[];
  };
  programmes: {
    /** Default small-capitals line above each day's date. */
    kicker: string;
    /** Default artwork for a programme day, its aspect ratio, and the open area for the copy. */
    background: string;
    /** Small pre-blurred copy of `background` for the wide-screen surround (cheap to render). */
    surround: string;
    artAspect: number;
    copyArea: ArtCopyArea;
    /** One pinned programme section per day, rendered in this order. */
    days: ProgrammeDayConfig[];
  };
  venue: VenueConfig;
  rsvp: RsvpConfig;
  scenes: [SceneConfig, SceneConfig, ...SceneConfig[]];
};

/**
 * Art direction and copy for the invitation.
 * Add further cinematic scenes to `scenes` — the scroll timeline will extend automatically.
 */
export const invitation: InvitationConfig = {
  card: {
    cover: "/images/envelope.jpg",
    liner: "/images/envelope.jpg",
    prompt: "Tap to Open",
    skipLabel: "Skip",
    names: "P & L",
    sealImage: "/images/seal.png",
    titleImage: "/images/pl-wedding-script.png",
  },
  seal: {
    letters: ["L", "P"],
    ariaLabel: "Open the invitation — LP wax seal",
  },
  couplePhoto: "/images/couple.png",
  coupleNames: {
    first: "Vaibhav",
    second: "Sanskruti",
    invitationLine: "ARE GETTING MARRIED",
  },
  logo: "/images/vs-peacock-logo.png",
  song: {
    src: "/audio/tainu-leke.mp3",
    startSeconds: 25,
  },
  wedding: {
    // 1 January 2027, the wedding celebration date.
    startsAt: "2027-01-01T00:00:00+05:30",
    timeZone: "Asia/Kolkata",
    celebrationMessage: "The celebrations have begun",
    datesLabel: "1st January 2027",
    scratchLabel: "Scratch me",
  },
  motion: {
    // Title (0–0.18) → names & couple (0.16–0.57, same pavilion background)
    // → dusk crossfade (0.52–0.80) → "Countdown to Forever" (from 0.76).
    scrollDistanceVh: 360,
    titleFadeStart: 0.06,
    titleFadeEnd: 0.18,
    namesStart: 0.16,
    namesEnd: 0.5,
    logoFadeEnd: 0.28,
    backgroundCrossfadeStart: 0.52,
    backgroundCrossfadeEnd: 0.8,
    sceneTwoTextStart: 0.76,
    openingDurationMs: 2400,
    programmeScrollVh: 180,
    sceneTransitionVh: 70,
    venueHoldVh: 40,
    rsvpHoldVh: 55,
    programmeRevealAt: [0.02, 0.36, 0.68],
  },
  programmes: {
    kicker: "Wedding Celebrations",
    // The gilded arch's empty wall in programme.jpg (576×1024).
    background: "/images/programme.jpg",
    surround: "/images/programme-soft.jpg",
    artAspect: 576 / 1024,
    copyArea: { top: 23, right: 17, bottom: 38.5, left: 17 },
    days: [],
  },
  venue: {
    heading: "The Wedding Venue",
    name: "Chopra Farms & Resorts",
    address: "Vill Dhumaspur, Gurugram",
    background: "/images/scene-1.jpg",
    mapQuery: "Chopra Farms & Resorts, Vill Dhumaspur, Gurugram",
    mapImage: "/images/venue-map.png",
  },
  rsvp: {
    heading: "RSVP",
    hosts: "Kriti & Ajinkya",
    closing: "With best compliments from",
    closingFrom: "Alex",
    background: "/images/scene-1.jpg",
  },
  scenes: [
    {
      id: "title-sequence",
      background: "/images/scene-1.jpg",
      title: "The P & L Wedding",
      // Hand-lettered script supplied by the couple (transparent PNG, ink colour).
      titleImage: "/images/pl-wedding-script.png",
      supportingText: "",
      couple: { x: 2, y: 102, height: 78, mobile: { x: 2, y: 108, height: 38 } },
      textAt: 0,
    },
    {
      id: "save-the-date",
      // Dusk palace gateway (736×1308): the countdown sits in the open sky above the roofline.
      background: "/images/save-the-date.jpg",
      surround: "/images/save-the-date-soft.jpg",
      artAspect: 736 / 1308,
      title: "Countdown to Forever",
      couple: { x: 55, y: 102, height: 76, mobile: { x: 24, y: 108, height: 38 } },
      textAt: 1,
    },
  ],
};

export const laterScenesNote =
  "Append additional objects to invitation.scenes to continue the cinematic sequence.";
