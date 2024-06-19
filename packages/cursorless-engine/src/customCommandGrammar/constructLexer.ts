import moo, { type Lexer, type LexerState, type Rules, type Token } from "moo";

export interface NearleyToken {
  value: any;
  [key: string]: any;
}

export interface NearleyLexer {
  reset: (chunk: any, info?: any) => NearleyLexer;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: any, message: string) => string;
  has: (tokenType: any) => boolean;
}

export function constructLexer(rules: Rules): NearleyLexer {
  const lexer = moo.compile(rules);
  return new LexerWithoutWhitespace(lexer);
}

interface State {
  placeholderIndex: number;
  mooState: LexerState;
}

class LexerWithoutWhitespace implements NearleyLexer {
  private placeholderIndex = 0;

  constructor(private lexer: Lexer) {}

  reset(chunk?: string, state?: State): this {
    const { placeholderIndex = 0, mooState } = state ?? {};

    this.lexer.reset(chunk, mooState);
    this.placeholderIndex = placeholderIndex;

    return this;
  }

  formatError(token: Token, message?: string): string {
    return this.lexer.formatError(token, message);
  }

  has(tokenType: string): boolean {
    return this.lexer.has(tokenType);
  }

  save(): State {
    return {
      placeholderIndex: this.placeholderIndex,
      mooState: this.lexer.save(),
    };
  }

  next(): NearleyToken | undefined {
    const rawToken = this.lexer.next();

    if (this.skipToken(rawToken)) {
      return this.next();
    }

    return rawToken?.type === "placeholderMark"
      ? { type: "placeholderMark", value: this.placeholderIndex++ }
      : rawToken;
  }

  transform({ value }: Token) {
    return value;
  }

  private skipToken(token: Token | undefined) {
    return token?.type === "ws";
  }
}
