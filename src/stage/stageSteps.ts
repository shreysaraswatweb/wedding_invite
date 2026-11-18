export type StageStepId =
  | "hero"
  | "countdown"
  | "day-dec-11"
  | "day-dec-12"
  | "venue"
  | "rsvp";

export type StageStep = {
  id: StageStepId;
  sceneId: string;
  label: string;
};

export const STAGE_STEPS: StageStep[] = [
  { id: "hero", sceneId: "cinema", label: "Lakshay & Prerna" },
  { id: "countdown", sceneId: "cinema", label: "Countdown" },
  { id: "day-dec-11", sceneId: "day-dec-11", label: "11 December" },
  { id: "day-dec-12", sceneId: "day-dec-12", label: "12 December" },
  { id: "venue", sceneId: "venue", label: "The Wedding Venue" },
  { id: "rsvp", sceneId: "rsvp", label: "RSVP" },
];

