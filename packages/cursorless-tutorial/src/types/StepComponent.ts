import { TutorialStepFragment } from "@cursorless/common";
import { TutorialStep } from "./tutorial.types";

/**
 * Represents a `{foo:bar}` component in a tutorial step, eg `{action:chuck}`.
 * It will be dynamically rendered when the tutorial step is displayed. For
 * example, the above component would render as the user's custom spoken form
 * for the `chuck` action, surrounded by quotes.
 *
 * Note that in addition to the {@link content} to display, the component can
 * optionally set other fields on the step, such as a {@link trigger} to advance
 * to the next step.
 */
export interface StepComponent extends Omit<TutorialStep, "content"> {
  /**
   * The content of the component to display in the tutorial step.
   */
  content: TutorialStepFragment;
}

/**
 * Interface for classes that parse a string into a {@link StepComponent}.
 */
export interface StepComponentParser {
  /**
   * Parses a string into a {@link StepComponent}.
   *
   * @param arg The string to parse. This will be between the `:` and `}` in a
   * component, eg `chuck` in `{action:chuck}`.
   */
  parse(arg: string): Promise<StepComponent>;
}
