import moo, {
  type Lexer as MooLexer,
  type LexerState as MooLexerState,
  type Rules,
  type Token as MooToken,
} from "moo";

export interface NearleyToken {
  value: any;
  [key: string]: any;
}

export interface NearleyLexer {
  reset: (chunk: any, info?: any) => this;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: any, message: string) => string;
  has: (tokenType: any) => boolean;
}

interface State {
  placeholderIndex: number;
  mooState: MooLexerState;
}

export class CommandLexer implements NearleyLexer {
  private placeholderIndex = 0;
  private mooLexer: MooLexer;

  constructor(rules: Rules) {
    this.mooLexer = moo.compile(rules);
  }

  reset(chunk?: string, state?: State): this {
    const { placeholderIndex = 0, mooState } = state ?? {};

    this.mooLexer.reset(chunk, mooState);
    this.placeholderIndex = placeholderIndex;

    return this;
  }

  formatError(token: MooToken, message?: string): string {
    return this.mooLexer.formatError(token, message);
  }

  has(tokenType: string): boolean {
    return this.mooLexer.has(tokenType);
  }

  save(): State {
    return {
      placeholderIndex: this.placeholderIndex,
      mooState: this.mooLexer.save(),
    };
  }

  next(): NearleyToken | undefined {
    const rawToken = this.mooLexer.next();

    if (this.skipToken(rawToken)) {
      return this.next();
    }

    return rawToken?.type === "placeholderMark"
      ? { type: "placeholderMark", value: this.placeholderIndex++ }
      : rawToken;
  }

  transform({ value }: MooToken) {
    return value;
  }

  private skipToken(token: MooToken | undefined) {
    return token?.type === "ws";
  }
}
