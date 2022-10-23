import { Range, TextEditor } from "vscode";

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

export function matchAll<T>(
  text: string,
  regex: RegExp,
  mapfn: (v: RegExpMatchArray, k: number) => T
) {
  // Reset the regex to start at the beginning of string, in case the regex has
  // been used before.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
  regex.lastIndex = 0;
  return Array.from(text.matchAll(regex), mapfn);
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

export function getMatchesInRange(
  regex: RegExp,
  editor: TextEditor,
  range: Range
): Range[] {
  const offset = editor.document.offsetAt(range.start);
  const text = editor.document.getText(range);

  return matchAll(
    text,
    regex,
    (match) =>
      new Range(
        editor.document.positionAt(offset + match.index!),
        editor.document.positionAt(offset + match.index! + match[0].length)
      )
  );
}
