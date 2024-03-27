import { ActiveTutorialState } from "@cursorless/common";
import { type FunctionComponent } from "react";

interface TutorialStepProps {
  state: ActiveTutorialState;
}

export const TutorialStep: FunctionComponent<TutorialStepProps> = ({
  state,
}) => {
  return (
    <div>
      <h1>{state.title}</h1>
      {state.stepContent}
    </div>
  );
};
