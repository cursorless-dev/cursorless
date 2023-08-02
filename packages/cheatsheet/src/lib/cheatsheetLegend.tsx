interface CheatsheetLegendEntry {
  term: string;
  definition: string;
  link?: string;
  id: string;
}

export type CheatsheetLegend = CheatsheetLegendEntry[];

const cheatsheetLegend: CheatsheetLegend = [
  {
    term: "formatter",
    definition: 'Formatter (eg "camel", "snake"). Say "format help" for a list',
    id: "formatter",
  },
  {
    term: "modifier",
    definition: "Cursorless modifier",
    link: "https://www.cursorless.org/docs/#modifiers",
    id: "modifier",
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
    id: "destinations",
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
    definition: "Ordinal, eg first, second, third",
    id: "ordinal",
  },
];

export default cheatsheetLegend;
