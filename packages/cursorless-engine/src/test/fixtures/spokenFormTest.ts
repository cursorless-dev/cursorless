import {
  ActionDescriptor,
  CommandResponse,
  CommandV6,
} from "@cursorless/common";

export interface SpokenFormTest {
  /**
   * The spoken form that should be tested.  Will be passed to Talon's
   * `actions.mimic` action.
   */
  spokenForm: string;

  /**
   * If this is set, we will mock the return value of the
   * `user.private_cursorless_run_rpc_command_get` action to return the given
   * value.
   */
  mockedGetValue: CommandResponse | undefined;

  /**
   * The sequence of Cursorless commands that should be executed when
   * {@link spokenForm} is spoken.
   */
  commands: CommandV6[];

  /**
   * If `true`, use community snippets instead of Cursorless snippets
   */
  useCommunitySnippets: boolean;
}

export function spokenFormTest(
  spokenForm: string,
  action: ActionDescriptor,
  mockedGetValue?: unknown,
  { useCommunitySnippets = false }: SpokenFormTestOpts = {},
): SpokenFormTest {
  return {
    spokenForm,
    mockedGetValue: wrapMockedGetValue(mockedGetValue),
    commands: [command(spokenForm, action)],
    useCommunitySnippets,
  };
}

export function multiActionSpokenFormTest(
  spokenForm: string,
  actions: ActionDescriptor[],
  mockedGetValue?: unknown,
  { useCommunitySnippets = false }: SpokenFormTestOpts = {},
): SpokenFormTest {
  return {
    spokenForm,
    mockedGetValue: wrapMockedGetValue(mockedGetValue),
    commands: actions.map((action) => command(spokenForm, action)),
    useCommunitySnippets,
  };
}

function wrapMockedGetValue(
  mockedGetValue: unknown,
): CommandResponse | undefined {
  return mockedGetValue == null ? undefined : { returnValue: mockedGetValue };
}

function command(spokenForm: string, action: ActionDescriptor): CommandV6 {
  return {
    version: 6,
    spokenForm,
    usePrePhraseSnapshot: true,
    action,
  };
}

export interface SpokenFormTestOpts {
  useCommunitySnippets?: boolean;
}
