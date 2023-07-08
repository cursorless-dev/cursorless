/*
 * Good source for more abbreviations
 * https://github.com/textlint-rule/sentence-splitter/blob/master/src/parser/lang/English.ts
 */

export const delimiters = [".", "?", "!"];

const abbreviationMonths = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  // "May"
  "Jun.",
  "Jul.",
  "Aug.",
  "Sep.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

const abbreviationsHonorificsAndTitles = [
  "Dr.",
  "Esq.",
  "Ing.",
  "Jr.",
  "Miss.",
  "Mr.",
  "Mrs.",
  "Ms.",
  "Prof.",
  "Sen.",
  "St.",
];

const abbreviationsMisc = [
  "Blvd.",
  "E.g.",
  "Etc.",
  "Hr.",
  "I.e.",
  "Inc.",
  "Mt.",
  "No.",
  "Nr.",
  "Ok.",
  "Vs.",
];

export const abbreviations = [
  ...abbreviationMonths,
  ...abbreviationsHonorificsAndTitles,
  ...abbreviationsMisc,
];
