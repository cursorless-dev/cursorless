interface Props {
  currentStep: number;
  stepCount: number;
}

/**
 * A progress bar that shows the current step in a tutorial.
 */
export function ProgressBar({ currentStep, stepCount }: Props) {
  const progress = ((currentStep + 1) / stepCount) * 100;
  return (
    <div className="tutorial-progress progress w-100 rounded-pill">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
}
