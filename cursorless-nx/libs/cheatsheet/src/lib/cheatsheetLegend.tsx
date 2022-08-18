interface CheatsheetLegendEntry {
  term: string;
  definition: string;
  link?: string;
  id: string;
}

export type CheatsheetLegend = CheatsheetLegendEntry[];

const cheatsheetLegend: CheatsheetLegend = [
  {
    term: 'F',
    definition: 'Formatter (eg "camel", "snake"). Say "format help" for a list',
    id: 'formatter',
  },
  {
    term: 'M',
    definition: 'Cursorless modifier',
    link: 'https://www.cursorless.org/docs/#modifiers',
    id: 'modifier',
  },
  {
    term: 'P',
    definition: 'Paired delimiter',
    link: '#pairedDelimiters',
    id: 'pairedDelimiter',
  },
  {
    term: 'S',
    definition: 'Current selection(s)',
    id: 'selection',
  },
  {
    term: 'T',
    definition: 'Cursorless target',
    link: 'https://www.cursorless.org/docs/#targets',
    id: 'target',
  },
  {
    term: 'number',
    definition: 'Number',
    id: 'number',
  },
];

export default cheatsheetLegend;
