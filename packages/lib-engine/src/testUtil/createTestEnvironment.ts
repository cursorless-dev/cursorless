import type {
  EditableTextEditor,
  MessageId,
  Messages,
  ScopeProvider,
} from "@cursorless/lib-common";
import {
  FakeIDE,
  InMemoryTextEditor,
  MessageType,
} from "@cursorless/lib-common";
import { FileSystemRawTreeSitterQueryProvider } from "@cursorless/lib-node-common";
import { createCursorlessEngine } from "..";
import { TestFileSystem } from "./TestFileSystem";
import { TestTreeSitter } from "./TestTreeSitter";

export interface TestEnvironment {
  openNewEditor: (
    content: string,
    languageId: string,
  ) => Promise<EditableTextEditor>;
  scopeProvider: ScopeProvider;
}

export async function createTestEnvironment(): Promise<TestEnvironment> {
  const ide = new FakeIDE(new TestMessages());
  const fileSystem = new TestFileSystem(ide.runMode, "testCursorlessDir");

  const treeSitterQueryProvider = new FileSystemRawTreeSitterQueryProvider(
    ide,
    fileSystem,
  );

  const treeSitter = new TestTreeSitter();

  const { languageDefinitions, scopeProvider } = await createCursorlessEngine({
    ide,
    treeSitterQueryProvider,
    treeSitter,
  });

  const openNewEditor = async (content: string, languageId: string) => {
    const editor = new InMemoryTextEditor({ ide, languageId, content });
    await languageDefinitions.loadLanguage(languageId);
    return editor;
  };

  return { openNewEditor, scopeProvider };
}

class TestMessages implements Messages {
  showMessage(
    type: MessageType,
    _id: MessageId,
    message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    switch (type) {
      case MessageType.info:
        console.log(message);
        break;
      case MessageType.warning:
        console.log(`[warn] ${message}`);
        break;
      case MessageType.error:
        console.log(`[error] ${message}`);
        break;
    }
    return Promise.resolve(undefined);
  }
}
