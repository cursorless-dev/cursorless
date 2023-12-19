import { ActionDescriptor, CommandV6 } from "@cursorless/common";

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
  mockedGetValue: unknown | undefined;

  /**
   * The sequence of Cursorless commands that should be executed when
   * {@link spokenForm} is spoken.
   */
  commands: CommandV6[];
}

export function spokenFormTest(
  spokenForm: string,
  action: ActionDescriptor,
  mockedGetValue?: unknown,
): SpokenFormTest {
  return {
    spokenForm,
    mockedGetValue,
    commands: [command(spokenForm, action)],
  };
}

export function multiActionSpokenFormTest(
  spokenForm: string,
  actions: ActionDescriptor[],
  mockedGetValue?: unknown,
): SpokenFormTest {
  return {
    spokenForm,
    mockedGetValue,
    commands: actions.map((action) => command(spokenForm, action)),
  };
}

function command(spokenForm: string, action: ActionDescriptor): CommandV6 {
  return {
    version: 6,
    spokenForm,
    usePrePhraseSnapshot: true,
    action,
  };
}
