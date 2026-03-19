export function endsWithChar(word: string, c: string) {
  if (c.length > 1) {
    return c.indexOf(word.slice(-1)) > -1;
  }

  return word.slice(-1) === c;
}

export function endsWith(word: string, end: string) {
  return word.slice(word.length - end.length) === end;
}
