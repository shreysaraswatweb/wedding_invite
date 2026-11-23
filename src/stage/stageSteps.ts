export type StageStepId =
  | "hero"
  | "invitation"
  | "countdown"
  | "celebrations"
  | "ceremony-four"
  | "ceremony-five"
  | "rsvp"
  | "warm-regards";

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
  { id: "ceremony-four", sceneId: "cinema", label: "Wedding Ceremony" },
  { id: "ceremony-five", sceneId: "cinema", label: "Reception" },
  { id: "rsvp", sceneId: "rsvp", label: "RSVP" },
  { id: "warm-regards", sceneId: "warm-regards", label: "Warm Regards" },
];

