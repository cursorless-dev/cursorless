const VAR_SPOKEN_FORM = "<spokenForm>";

export function injectSpokenForm(
  pattern: string,
  defaultSpokenForm: string | undefined,
): string {
  if (defaultSpokenForm == null) {
    if (pattern.includes(VAR_SPOKEN_FORM)) {
      throw new Error(
        `Pattern "${pattern}" contains ${VAR_SPOKEN_FORM}, but no defaultSpokenForm is provided`,
      );
    }
    return pattern;
  }
  return pattern.replaceAll(VAR_SPOKEN_FORM, defaultSpokenForm);
}
