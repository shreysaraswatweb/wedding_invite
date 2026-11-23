export type StageStepId =
  | "hero"
  | "invitation"
  | "countdown"
  | "celebrations"
  | "ceremony-four"
  | "ceremony-five"
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
  { id: "invitation", sceneId: "cinema", label: "Wedding Invitation" },
  { id: "countdown", sceneId: "cinema", label: "Countdown" },
  { id: "celebrations", sceneId: "cinema", label: "Haldi Ceremony" },
  { id: "ceremony-four", sceneId: "cinema", label: "Celebration" },
  { id: "ceremony-five", sceneId: "cinema", label: "Ceremony" },
  { id: "day-dec-11", sceneId: "day-dec-11", label: "11 December" },
  { id: "day-dec-12", sceneId: "day-dec-12", label: "12 December" },
  { id: "venue", sceneId: "venue", label: "The Wedding Venue" },
  { id: "rsvp", sceneId: "rsvp", label: "RSVP" },
];

