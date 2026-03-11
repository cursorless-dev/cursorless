import {
  FakeIDE,
  InMemoryTextDocument,
  Selection,
  type EditableTextEditor,
  type MessageId,
  type Messages,
  type MessageType,
} from "@cursorless/common";
import { FileSystemRawTreeSitterQueryProvider } from "@cursorless/node-common";
import { URI } from "vscode-uri";
import { createCursorlessEngine } from "..";
import { TestEditor } from "./TestEditor";
import { TestFileSystem } from "./TestFileSystem";
import { TestTreeSitter } from "./TestTreeSitter";

export async function createTestEnvironment() {
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
    const editor = createNewEditor(content, languageId);
    await languageDefinitions.loadLanguage(languageId);
    return editor;
  };

  return { openNewEditor, scopeProvider };
}

let nextId = 0;

function createNewEditor(
  content: string,
  languageId: string,
): EditableTextEditor {
  const id = String(nextId++);
  const uri = URI.parse(`talon-js://${id}`);
  const document = new InMemoryTextDocument(uri, languageId, content);
  const visibleRanges = [document.range];
  const selections = [new Selection(0, 0, 0, 0)];
  const editor = new TestEditor(id, document, visibleRanges, selections);
  return editor;
}

class TestMessages implements Messages {
  showMessage(
    type: MessageType,
    _id: MessageId,
    message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    switch (type) {
      case "info":
        console.log(message);
        break;
      case "warning":
        console.log(`[warn] ${message}`);
        break;
      case "error":
        console.log(`[error] ${message}`);
        break;
    }
    return Promise.resolve(undefined);
  }
}
