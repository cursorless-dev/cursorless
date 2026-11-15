export function shouldSkipRecordedTest(name: string): boolean {
  switch (name) {
    case "recorded/docs/actions/randomizeTargets":
      return true;
    // No default
  }

  return false;
}
