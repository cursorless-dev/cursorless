type Namespace = "user";

interface Actions {
  clip: {
    set_text(text: string): void;
    text(): string;
  };
  app: {
    notify(body: string, title: string): void;
  };
  user: {
    cursorless_js_command(...args: unknown[]): void;
  };
}

declare module "talon" {
  const actions: Actions;

  class Context {
    matches: string;
    tags: string[];
    settings: Record<string, string | number | boolean>;
    lists: Record<string, Record<string, string> | string[]>;
    action_class(name: Namespace, actions: Partial<Actions[Namespace]>): void;
  }

  const settings: {
    get<T extends string | number | boolean>(
      name: string,
      defaultValue?: T,
    ): T | null;
  };
}
