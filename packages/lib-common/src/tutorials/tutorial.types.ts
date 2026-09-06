import type { TutorialId } from "../types/tutorial.types";

export type TutorialContext = "documentation" | "interactive";

export interface RawTutorialContent {
  id: TutorialId;
  title: string;
  description: string;
  excludeIn?: TutorialContext[];
  steps: (StepContent | ContextStep)[];
}

type StepContent = string | string[];

type ContextStep = Record<TutorialContext, StepContent>;

export interface ResolvedTutorialContent extends Omit<
  RawTutorialContent,
  "steps"
> {
  position: number;
  steps: string[];
}
