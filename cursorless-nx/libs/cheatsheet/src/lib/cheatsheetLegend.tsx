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
    term: 'P',
    definition: 'Paired delimiter',
    link: '#paired-delimiters',
    id: 'paired-delimiter',
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
];

export default cheatsheetLegend;
