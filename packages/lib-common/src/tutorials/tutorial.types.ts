import type { TutorialId } from "../types/tutorial.types";

export type TutorialContext = "documentation" | "interactive";

export interface RawTutorialContent {
  id: TutorialId;
  title: string;
  description: string;
  excludeIn?: TutorialContext[];
  steps: string[];
}
