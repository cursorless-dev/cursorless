interface CheatsheetLegendEntry {
  term: string;
  definition: string;
  link?: string;
  linkName?: string;
  id: string;
}

export type CheatsheetLegend = CheatsheetLegendEntry[];

const cheatsheetLegend: CheatsheetLegend = [
  {
    term: "formatter",
    definition:
      'Formatter (eg "camel", "snake"). Say "help format" for a list.',
    id: "formatter",
  },
  {
    term: "snippet",
    definition: '(eg "if", "for"). Say "help snip" for a list.',
    link: "https://github.com/talonhub/community/tree/main/core/snippets",
    linkName: "Community snippet",
    id: "snippet",
  },
  {
    term: "pair",
    definition: "Paired delimiter",
    link: "#pairedDelimiters",
    id: "pairedDelimiter",
  },
  {
    term: "target",
    definition: "Cursorless target",
    link: "https://www.cursorless.org/docs/#targets",
    id: "target",
  },
  {
    term: "destination",
    definition: "Cursorless destination",
    link: "#destinations",
    id: "destination",
  },
  {
    term: "modifier",
    definition: "Cursorless modifier",
    link: "#modifiers",
    id: "modifier",
  },
  {
    term: "scope",
    definition: "Cursorless scope",
    link: "#scopes",
    id: "scope",
  },
  {
    term: "number",
    definition: "Number",
    id: "number",
  },
  {
    term: "ordinal",
    definition: 'Ordinal (eg "first", "second", "third")',
    id: "ordinal",
  },
];

export default cheatsheetLegend;
