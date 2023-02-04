function _rightAnchored(regex: RegExp) {
  const { source, flags } = regex;

  return new RegExp(`(${source})$`, flags.replace("m", ""));
}

function _leftAnchored(regex: RegExp) {
  const { source, flags } = regex;

  return new RegExp(`^(${source})`, flags.replace("m", ""));
}

function makeCache<T, U>(func: (arg: T) => U) {
  const cache: Map<T, U> = new Map();

  function wrapper(arg: T): U {
    let cachedValue: U | undefined = cache.get(arg);

    if (cachedValue == null) {
      cachedValue = func(arg);
      cache.set(arg, cachedValue);
    }

    return cachedValue;
  }

  return wrapper;
}

export const rightAnchored = makeCache(_rightAnchored);
export const leftAnchored = makeCache(_leftAnchored);

/**
 * Match {@link regex} at start of {@link text}
 * @param text The text in which to search
 * @param regex The regex to search for
 * @returns The index at which the {@link regex} ends, or -1 if it doesn't
 * appear at the start of {@link text}
 */
export function matchAtStart(text: string, regex: RegExp): number {
  const leftAnchoredRegex = leftAnchored(regex);
  leftAnchoredRegex.lastIndex = 0;
  return text.match(leftAnchoredRegex)?.[0].length ?? -1;
}

/**
 * Match {@link regex} at end of {@link text}
 * @param text The text in which to search
 * @param regex The regex to search for
 * @returns The index at which the {@link regex} starts, or -1 if it doesn't
 * appear at the end of {@link text}
 */
export function matchAtEnd(text: string, regex: RegExp): number {
  const rightAnchoredRegex = rightAnchored(regex);
  rightAnchoredRegex.lastIndex = 0;
  return text.search(rightAnchoredRegex);
}

export function matchAll<T>(
  text: string,
  regex: RegExp,
  mapfn: (v: RegExpMatchArray, k: number) => T,
) {
  // Reset the regex to start at the beginning of string, in case the regex has
  // been used before.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
  regex.lastIndex = 0;
  return Array.from(text.matchAll(regex), mapfn);
}

export function testRegex(regex: RegExp, text: string): boolean {
  // Reset the regex to start at the beginning of string, in case the regex has
  // been used before.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
  regex.lastIndex = 0;
  return regex.test(text);
}

export interface MatchedText {
  index: number;
  text: string;
}

export function matchText(text: string, regex: RegExp): MatchedText[] {
  return matchAll(text, regex, (match) => ({
    index: match.index!,
    text: match[0],
  }));
}
