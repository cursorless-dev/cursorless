import {
  Edit,
  Position,
  Range,
  TextDocument,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";
import { Window } from "neovim";
import { getNeovimIDE, updateTextEditor } from "../../neovimHelpers";
import { neovimClient } from "../../singletons/client.singleton";
import { eventEmitter } from "../../events";

export default async function neovimEdit(
  window: Window,
  edits: Edit[],
): Promise<boolean> {
  // We start applying the edits from the end of the document
  // to make sure the edit ranges for the remaining one are stable
  edits.reverse();
  edits.sort((a, b) => {
    if (a.range.start.line === b.range.start.line) {
      return b.range.start.character - a.range.start.character;
    }
    return b.range.start.line - a.range.start.line;
  });

  // TODO: notify here bulking all changes?
  const client = neovimClient();
  const document = getNeovimIDE().getTextDocument(
    await client.window.buffer,
  ) as TextDocument;
  const changes: TextDocumentContentChangeEvent[] = [];
  for (const edit of edits) {
    changes.push({
      range: edit.range,
      rangeOffset: document.offsetAt(edit.range.start),
      rangeLength:
        document.offsetAt(edit.range.end) - document.offsetAt(edit.range.start),
      text: edit.text,
    });
  }
  eventEmitter.emit("onDidChangeTextDocument", {
    document: document,
    contentChanges: changes,
  });

  for (const edit of edits) {
    const { range, text, isReplace } = edit;

    if (text === "") {
      await neovimDelete(range);
    } else if (range.isEmpty && !isReplace) {
      await neovimInsert(range.start, text);
    } else {
      await neovimReplace(range, text);
    }
  }

  // update our view of the document
  await updateTextEditor();
  return true;
}

async function neovimDelete(range: Range): Promise<void> {
  console.warn(`neovimDelete(): range=${JSON.stringify(range)}`);
  const client = neovimClient();
  const buffer = await client.window.buffer;

  // only keep the end of the last line
  const lastLine = (
    await buffer.getLines({
      start: range.end.line,
      end: range.end.line + 1,
      strictIndexing: true,
    })
  )[0];
  const endOfLastLine = lastLine.slice(range.end.character);

  // are we only modifying one existing line?
  if (range.start.line === range.end.line) {
    // only keep the beginning and end of the line
    const singleLine = lastLine.slice(0, range.start.character) + endOfLastLine;
    // update that single line
    await buffer.setLines(singleLine, {
      start: range.start.line,
      end: range.start.line + 1,
      strictIndexing: true,
    });
    return;
  }

  // we are modifying multiple lines

  // are we not including the beginning of the first line?
  if (range.start.character === 0) {
    // if we are deleting from the start of the first line, we need to exclude the first line
    await buffer.setLines(endOfLastLine, {
      start: range.start.line,
      end: range.end.line + 1,
      strictIndexing: true,
    });
    return;
  }

  // only keep the beginning of the first line
  const firstLine = (
    await buffer.getLines({
      start: range.start.line,
      end: range.start.line + 1,
      strictIndexing: true,
    })
  )[0];
  const startOfFirstLine = firstLine.slice(0, range.start.character);

  // are we not including the newline at the end of the first line?
  if (range.start.character === firstLine.length) {
    // if we are deleting from the end of the first line, we need to append the last line to the first line
    await buffer.setLines(startOfFirstLine + endOfLastLine, {
      start: range.start.line,
      end: range.end.line + 1,
      strictIndexing: true,
    });
    return;
  }

  await buffer.setLines([startOfFirstLine, endOfLastLine], {
    start: range.start.line,
    end: range.end.line + 1,
    strictIndexing: true,
  });
}

async function neovimInsert(position: Position, text: string) {
  console.warn(
    `neovimInsert(): position=${JSON.stringify(position)}, text='${text}'`,
  );
  // standardise newlines so we can easily split the lines
  const newLines = text.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

  const client = neovimClient();
  const buffer = await client.window.buffer;

  const lineWhereInsertion = (
    await buffer.getLines({
      start: position.line,
      end: position.line + 1,
      strictIndexing: true,
    })
  )[0];
  const startOfFirstLine = lineWhereInsertion.slice(0, position.character);
  const endOfLastLine = lineWhereInsertion.slice(position.character);

  // are we only inserting into one existing line?
  if (newLines.length == 1) {
    const singleLine = startOfFirstLine + newLines[0] + endOfLastLine;
    // update that single line
    await buffer.setLines(singleLine, {
      start: position.line,
      end: position.line + 1,
      strictIndexing: true,
    });
    return;
  }

  // we are inserting multiple lines

  const firstLine = startOfFirstLine + newLines[0];
  const lastLine = newLines[newLines.length - 1] + endOfLastLine;
  await buffer.setLines(
    [firstLine, ...newLines.slice(1, newLines.length - 1), lastLine],
    {
      start: position.line,
      end: position.line + 1,
      strictIndexing: true,
    },
  );
}

async function neovimReplace(range: Range, text: string) {
  console.warn(
    `neovimReplace(): range=${JSON.stringify(range)}, text='${text}'`,
  );
  await neovimDelete(range);
  await neovimInsert(range.start, text);
}
