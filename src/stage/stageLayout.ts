import { invitation } from "../config/invitation";

/**
 * Where every scene and transition sits on the stage's scroll runway, in
 * viewport-height units (vh × 100). One source of truth for the crossfades
 * and for each scene's own reveals.
 *
 *   cinema (opening title → "You are invited")
 *   ⟶ crossfade ⟶ 11 December ⟶ crossfade ⟶ 12 December ⟶ crossfade ⟶ venue
 *   ⟶ crossfade ⟶ RSVP
 */
export type Segment = { start: number; length: number };

export type StageLayout = {
  /** One entry per stage layer, in stacking order. */
  scenes: { id: string; segment: Segment }[];
  /** transitions[i] crossfades scenes[i] → scenes[i + 1]. */
  transitions: Segment[];
  /** Total scroll distance of the runway. */
  totalVh: number;
};

export function buildStageLayout(dayIds: string[]): StageLayout {
  const { scrollDistanceVh, programmeScrollVh, sceneTransitionVh, rsvpHoldVh } =
    invitation.motion;
  const holds = [
    { id: "cinema", length: scrollDistanceVh },
    ...dayIds.map((id) => ({ id: `day-${id}`, length: programmeScrollVh })),
    { id: "warm-regards", length: rsvpHoldVh },
  ];

  const scenes: StageLayout["scenes"] = [];
  const transitions: Segment[] = [];
  let cursor = 0;
  holds.forEach((hold, index) => {
    if (index > 0) {
      transitions.push({ start: cursor, length: sceneTransitionVh });
      cursor += sceneTransitionVh;
    }
    scenes.push({ id: hold.id, segment: { start: cursor, length: hold.length } });
    cursor += hold.length;
  });

  return { scenes, transitions, totalVh: cursor };
}

export const stageLayout = buildStageLayout(invitation.programmes.days.map((day) => day.id));

/** Index of a scene in the stage, by id. */
export function sceneIndex(id: string) {
  return stageLayout.scenes.findIndex((scene) => scene.id === id);
}

/**
 * Converts a runway position (vh units) into a ScrollTrigger start/end string
 * on the stage element. Positions are scaled to the runway's real pixel length,
 * so they stay exact whatever the device's viewport units resolve to.
 */
export function stagePosition(stage: HTMLElement, vhPosition: number) {
  return () => {
    const distance = Math.max(1, stage.offsetHeight - window.innerHeight);
    return `top+=${(vhPosition / stageLayout.totalVh) * distance} top`;
  };
}

/** The page scroll offset at a runway position (for focus-follow navigation). */
export function stageScrollTop(stage: HTMLElement, vhPosition: number) {
  const distance = Math.max(1, stage.offsetHeight - window.innerHeight);
  return stage.getBoundingClientRect().top + window.scrollY + (vhPosition / stageLayout.totalVh) * distance;
}

export type SnapBeat = { id: string; progress: number };

/**
 * Resting points of the invitation, as 0–1 progress along the stage runway.
 * A flick of the wheel or a swipe settles on the next of these rather than
 * stopping mid-crossfade: title, names, countdown, each programme day, venue, RSVP.
 */
export function stageSnapBeats(): SnapBeat[] {
  const { namesStart, namesEnd, sceneTwoTextStart, programmeRevealAt } = invitation.motion;
  const beats: SnapBeat[] = [];

  const cinema = stageLayout.scenes[sceneIndex("cinema")];
  if (cinema) {
    const { start, length } = cinema.segment;
    beats.push({ id: "cinema-title", progress: start / stageLayout.totalVh });
    beats.push({
      id: "cinema-names",
      progress: (start + length * ((namesStart + namesEnd) / 2)) / stageLayout.totalVh,
    });
    beats.push({
      id: "cinema-countdown",
      progress: (start + length * Math.min(0.94, sceneTwoTextStart + 0.14)) / stageLayout.totalVh,
    });
  }

  stageLayout.scenes.slice(1).forEach((scene) => {
    const settled = scene.id.startsWith("day-")
      ? (programmeRevealAt.at(-1) ?? 0.7)
      : 0.22;
    beats.push({
      id: scene.id,
      progress: (scene.segment.start + scene.segment.length * settled) / stageLayout.totalVh,
    });
  });

  return beats
    .filter((beat) => beat.progress >= 0 && beat.progress <= 1)
    .sort((a, b) => a.progress - b.progress);
}

export function stageSnapProgresses() {
  return [...new Set(stageSnapBeats().map((beat) => beat.progress))];
}
