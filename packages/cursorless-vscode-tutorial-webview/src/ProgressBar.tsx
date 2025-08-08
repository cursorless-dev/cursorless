import { type FunctionComponent } from "react";

interface ProgressBarProps {
  currentStep: number;
  stepCount: number;
}

/**
 * A progress bar that shows the current step in a tutorial.
 *
 * From https://flowbite.com/docs/components/progress/
 */
export const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  currentStep,
  stepCount,
}) => {
  const progress = ((currentStep + 1) / stepCount) * 100;
  return (
    <div className="bg-(--vscode-welcomePage-progress\.background) h-2.5 w-full rounded-full">
      <div
        className="bg-(--vscode-welcomePage-progress\.foreground) h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};
