import * as sinon from "sinon";
import { MessageType, Messages, asyncSafety } from "@cursorless/common";
import type { ExtensionContext, Uri } from "vscode";
import { ReleaseNotes, VERSION_KEY, WHATS_NEW } from "./ReleaseNotes";
import { VscodeApi } from "@cursorless/vscode-common";

interface Input {
  /** Whether the VSCode window is focused */
  isFocused: boolean;
  storedVersion: string | undefined;
  currentVersion: string;
  /** `true` if they pressed `What's new?` */
  pressedButton?: boolean;
}

interface Output {
  /** The new version added to storage, or `false` if none added */
  storedVersion: string | false;
  showedMessage: boolean;
  openedUrl?: boolean;
}

interface TestCase {
  input: Input;
  expectedOutput: Output;
}

const testCases: TestCase[] = [
  {
    input: {
      isFocused: false,
      storedVersion: undefined,
      currentVersion: "0.28.0",
    },
    expectedOutput: {
      storedVersion: "0.28.0",
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: true,
      storedVersion: undefined,
      currentVersion: "0.28.0",
    },
    expectedOutput: {
      storedVersion: "0.28.0",
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: false,
      storedVersion: "0.28.0",
      currentVersion: "0.28.0",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: true,
      storedVersion: "0.28.0",
      currentVersion: "0.28.0",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: false,
      storedVersion: "0.28.0",
      currentVersion: "0.28.10",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: true,
      storedVersion: "0.28.0",
      currentVersion: "0.28.10",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: false,
      storedVersion: "0.28.0",
      currentVersion: "0.26.0",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: true,
      storedVersion: "0.28.0",
      currentVersion: "0.26.0",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: false,
      storedVersion: "0.28.0",
      currentVersion: "0.29.10",
    },
    expectedOutput: {
      storedVersion: false,
      showedMessage: false,
    },
  },
  {
    input: {
      isFocused: true,
      storedVersion: "0.28.0",
      currentVersion: "0.29.10",
    },
    expectedOutput: {
      storedVersion: "0.29.0",
      showedMessage: true,
    },
  },
  {
    input: {
      isFocused: true,
      storedVersion: "0.28.0",
      currentVersion: "0.29.10",
      pressedButton: true,
    },
    expectedOutput: {
      storedVersion: "0.29.0",
      showedMessage: true,
      openedUrl: true,
    },
  },
];

suite("release notes", async function () {
  teardown(() => {
    sinon.restore();
  });

  testCases.forEach(({ input, expectedOutput }) => {
    test(
      getTestName(input),
      asyncSafety(() => runTest(input, expectedOutput)),
    );
  });
});

function getTestName(input: Input) {
  const nameComponents = [
    input.isFocused ? "focused" : "unfocused",
    String(input.storedVersion),
    input.currentVersion,
  ];

  if (input.pressedButton) {
    nameComponents.push("pressed");
  }

  return nameComponents.join(" ");
}

async function runTest(input: Input, expectedOutput: Output) {
  const {
    extensionContext,
    messages,
    openExternal,
    update,
    showMessage,
    vscodeApi,
  } = await getFakes(input);

  await new ReleaseNotes(vscodeApi, extensionContext, messages).maybeShow();

  if (expectedOutput.storedVersion === false) {
    sinon.assert.notCalled(update);
  } else {
    sinon.assert.calledOnceWithExactly(
      update,
      VERSION_KEY,
      expectedOutput.storedVersion,
    );
  }

  if (expectedOutput.showedMessage) {
    sinon.assert.calledOnceWithExactly(
      showMessage,
      sinon.match.any,
      "releaseNotes",
      sinon.match.any,
      sinon.match.any,
    );

    if (expectedOutput.openedUrl) {
      sinon.assert.calledOnce(openExternal);
    } else {
      sinon.assert.notCalled(openExternal);
    }
  } else {
    sinon.assert.notCalled(showMessage);
  }
}

async function getFakes(input: Input) {
  const openExternal = sinon.fake.resolves<[Uri], Promise<boolean>>(true);
  const vscodeApi = {
    window: {
      state: {
        focused: input.isFocused,
      },
    },
    env: {
      openExternal,
    },
  } as unknown as VscodeApi;

  const update = sinon.fake<[string, string], Promise<void>>();
  const extensionContext = {
    globalState: {
      get() {
        return input.storedVersion;
      },
      update,
    },
    extension: {
      packageJSON: {
        version: input.currentVersion,
      },
    },
  } as unknown as ExtensionContext;

  const showMessage = sinon.fake.resolves<
    [MessageType, string, string, ...string[]],
    Promise<string | undefined>
  >(input.pressedButton ? WHATS_NEW : undefined);
  const messages: Messages = {
    showMessage,
  };

  return {
    extensionContext,
    messages,
    openExternal,
    update,
    showMessage,
    vscodeApi,
  };
}
