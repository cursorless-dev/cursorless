import { getHighlighter, Lang } from 'shiki';
import { renderToHtml, HatType, SelectionType, Token } from './renderToHtml';

export interface SelectionAnchor {
  line: number;
  character: number;
}

interface CursorlessFixtureSelection {
  type: 'line' | 'selection';
  name?: string;
  anchor: SelectionAnchor;
  active: SelectionAnchor;
}
interface CursorlessFixtureState {
  documentContents: any;
  marks?: Record<
    `${HatType}.${string}`,
    { start: { line: number; character: number } }
  >;
  decorations?: CursorlessFixtureSelection[];
  selections?: CursorlessFixtureSelection[];
  thatMark?: [CursorlessFixtureSelection];
  sourceMark?: [CursorlessFixtureSelection];
}

export async function generateHtml(state: CursorlessFixtureState, lang: Lang) {
  return new HTMLGenerator(state, lang).generate();
}

const highlighter = getHighlighter({ theme: 'css-variables' });

class HTMLGenerator {
  private state: CursorlessFixtureState;
  private lang: Lang;
  private tokens: Token[][];
  private lineOptions: any[];

  constructor(state: CursorlessFixtureState, lang: Lang) {
    this.state = state;
    this.lang = lang;
    this.tokens = [];
    this.lineOptions = [];
  }

  async generate() {
    await this.getTokens();
    this.applyMarks();
    this.applyAllSelections();
    return renderToHtml(this.tokens, {
      bg: 'var(--shiki-color-background)',
      fg: 'var(--shiki-color-text)',
      lineOptions: this.lineOptions,
    });
  }

  async getTokens() {
    this.tokens = (await highlighter)
      .codeToThemedTokens(this.state.documentContents, this.lang)
      .map((line) =>
        line.map(
          (token) =>
            ({
              ...token,
              type: 'token',
            } as Token)
        )
      );
  }

  applyMarks() {
    Object.entries(this.state.marks || {}).forEach(([key, mark]) => {
      const [type, letterArg] = key.split('.') as [HatType, string];
      const letter = !letterArg || letterArg === '' ? '.' : letterArg;
      const line = this.tokens[mark.start.line];
      if (!line) return;
      this.insertHat(
        line as Extract<Token, { type: 'token' | 'hat' }>[],
        type,
        letter,
        mark.start.character
      );
    });
  }
  insertHat(
    line: Extract<Token, { type: 'token' | 'hat' }>[],
    hatType: HatType,
    markCharacter: string,
    wordStart: number
  ) {
    let rawIndex = 0;
    for (let t = 0; t < line.length; t += 1) {
      const token = line[t];
      if (token.content.length + rawIndex < wordStart) {
        rawIndex += token.content.length;
        continue;
      }
      for (let i = 0; i < token.content.length; i += 1) {
        rawIndex += 1;
        if (token.content[i] === markCharacter) {
          line.splice(
            t,
            1,
            { ...token, content: token.content.substring(0, i) },
            {
              type: 'hat',
              hatType,
              content: token.content.substring(i, i + 1),
            },
            { ...token, content: token.content.substring(i + 1) }
          );
          return;
        }
      }
      throw new Error(`Mark not found`);
    }
  }

  applyAllSelections() {
    if (!this.applySelectionsFromState('decorations')) {
      this.applySelectionsFromState('selections');
    }
    this.applySelectionsFromState('thatMark');
    this.applySelectionsFromState('sourceMark');
  }

  applySelectionsFromState(
    key: 'decorations' | 'selections' | 'thatMark' | 'sourceMark'
  ): boolean {
    const selections = this.state[key];
    if (!selections?.length) return false;
    const selectionParser = new SelectionParser(
      this.tokens,
      key.replace(/s$/gi, '') as SelectionType
    );
    selections.forEach((selection) => {
      if (selection.type === 'line') {
        return this.applyLineSelection(key, selection);
      }
      selectionParser.parse(selection);
    });
    return true;
  }

  getSelectionClasses(
    selectionType: keyof typeof this.state,
    selection: CursorlessFixtureSelection
  ) {
    const classes = [selectionType.replace(/s$/g, '')];
    if (selection.name) {
      classes.push(selection.name);
    }
    return classes;
  }

  applyLineSelection(
    selectionType: keyof typeof this.state,
    selection: CursorlessFixtureSelection
  ) {
    const classes = this.getSelectionClasses(selectionType, selection);
    const { anchor: start, active: end } = selection;
    for (let i = start.line + 1; i <= end.line + 1; i += 1)
      this.lineOptions.push({
        line: i,
        classes,
      });
  }
}

class SelectionParser {
  private lines: Token[][];
  private selectionType: SelectionType;

  constructor(lines: Token[][], selectionType: SelectionType) {
    this.lines = lines;
    this.selectionType = selectionType;
  }

  parse(selection: CursorlessFixtureSelection) {
    const { anchor: start, active: end } = selection;
    for (let l = end.line; l <= start.line; l += 1) {
      if (l !== end.line && l !== start.line) {
        this.handleInsideLine(l);
        continue;
      }
      this.lines[l] = this.parseLine(l, start, end);
    }
  }

  parseLine(l: number, start: SelectionAnchor, end: SelectionAnchor) {
    const lineParser = new SelectionLineParser(
      this.selectionType,
      this.lines[l]
    );
    if (end.line === start.line)
      return lineParser.parse(start.character, end.character);
    if (l === end.line) return lineParser.parse(0, end.character);
    return lineParser.parse(start.character, Infinity);
  }

  handleInsideLine(currentLine: number) {
    this.lines[currentLine] = [
      {
        type: 'selection',
        selection: this.lines[currentLine],
        className: this.selectionType,
      },
    ];
  }
}

type BaseToken = Exclude<Token, { type: 'selection' }>;

class SelectionLineParser {
  selectionType: SelectionType;
  line: Token[];
  result: Token[];
  activeSelectionTypes: SelectionType[];
  startIndex: number;
  endIndex: number;
  rawIndex = 0;

  constructor(selectionType: SelectionType, line: Token[]) {
    this.selectionType = selectionType;
    this.line = [...line];
    this.result = [];
    this.activeSelectionTypes = [];
    this.startIndex = 0;
    this.endIndex = Infinity;
  }

  hasRemainingTokens() {
    return this.line.length > 0;
  }

  getTokenState(tokenStart: number, tokenEnd: number) {
    if (tokenEnd <= this.startIndex || this.endIndex <= tokenStart)
      return 'outside';
    if (tokenStart === this.startIndex && tokenEnd === this.endIndex)
      return 'entire';
    if (!this.getCurrentSelectionToken() && tokenEnd >= this.endIndex)
      return 'inner';
    if (!this.getCurrentSelectionToken()) return 'start';
    if (tokenEnd >= this.endIndex) return 'end';
    return 'continue';
  }

  getCurrentSelectionToken() {
    const lastResult = this.result[this.result.length - 1];
    return lastResult?.type === 'selection' ? lastResult : undefined;
  }

  parseToken(token: Token | undefined) {
    if (!token) return;
    if (token.type === 'selection') return; // TODO recurse
    const tokenStart = this.rawIndex;
    this.incrementRawIndex(token);
    const tokenEnd = this.rawIndex;
    const state = this.getTokenState(tokenStart, tokenEnd);
    console.log('[debug]', {
      state,
      tokenStart,
      tokenEnd,
      token,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
    });
    switch (state) {
      case 'outside': {
        this.result.push(token);
        return;
      }
      case 'entire': {
        this.handleWholeSelectionToken(token);
        return;
      }
      case 'start': {
        this.startSelection(token);
        return;
      }
      case 'continue': {
        this.getCurrentSelectionToken()?.selection.push(token);
        return;
      }
    }
  }

  getCurrentSelectionClassName() {
    return this.selectionType;
  }

  incrementRawIndex(token: BaseToken) {
    this.rawIndex += token.content.length;
  }

  handleWholeSelectionToken(token: BaseToken) {
    this.result.push({
      type: 'selection',
      className: this.getCurrentSelectionClassName(),
      selection: [token],
    });
  }

  startSelection(token: BaseToken) {
    const stringLength = this.rawIndex - this.startIndex;
    if (stringLength === token.content.length) {
      this.handleWholeSelectionToken(token);
    }
    const selectionStartIndex = token.content.length - stringLength;
    const preSelectionContent = token.content.substring(0, selectionStartIndex);
    const selectionContent = token.content.substring(selectionStartIndex);
    this.result.push({
      ...token,
      content: preSelectionContent,
    });
    this.result.push({
      type: 'selection',
      className: this.getCurrentSelectionClassName(),
      selection: [{ ...token, content: selectionContent }],
    });
  }

  parse(startIndex: number, endIndex: number) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.rawIndex = 0;
    while (this.hasRemainingTokens()) {
      this.parseToken(this.line.shift());
    }
    return this.result;
  }
}
