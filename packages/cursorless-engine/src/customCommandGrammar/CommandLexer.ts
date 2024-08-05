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
  transform({ value }: NearleyToken): string;
}

interface State {
  mooState: MooLexerState;
}

export class CommandLexer implements NearleyLexer {
  private mooLexer: MooLexer;

  constructor(rules: Rules) {
    this.mooLexer = moo.compile(rules);
  }

  reset(chunk?: string, state?: State): this {
    const { mooState } = state ?? {};

    this.mooLexer.reset(chunk, mooState);

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
      mooState: this.mooLexer.save(),
    };
  }

  next(): NearleyToken | undefined {
    const token = this.mooLexer.next();

    if (this.skipToken(token)) {
      return this.next();
    }

    return token;
  }

  transform({ value }: NearleyToken) {
    return value;
  }

  private skipToken(token: MooToken | undefined) {
    return token?.type === "ws";
  }
}
