import type {
  Edit,
  Position,
  Range,
  TextDocument,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";
import type { NeovimClient, Window } from "neovim";
import type { NeovimIDE } from "./NeovimIDE";
import { getNeovimRegistry } from "@cursorless/neovim-registry";

export default async function neovimEdit(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  window: Window,
  edits: Edit[],
): Promise<boolean> {
  console.debug("neovimEdit() [unsorted]:");
  for (const edit of edits) {
    console.debug(
      `\trange=${JSON.stringify(edit.range)}, text='${edit.text}', isReplace=${edit.isReplace}`,
    );
  }

  edits.sort((a, b) => {
    // console.debug(
    //   `a=${JSON.stringify(a.range)}, text='${a.text}', isReplace=${a.isReplace}`,
    // );
    // console.debug(
    //   `b=${JSON.stringify(b.range)}, text='${b.text}', isReplace=${b.isReplace}`,
    // );
    // We apply the insert/replace edits from the start of the document
    // as a later one assume the previous ones have already been applied
    if ((isInsert(a) || isReplace(a)) && (isInsert(b) || isReplace(b))) {
      // console.debug("a is insert/replace and b is insert/replace");
      return 1;
    }
    // We apply the delete edits from the end of the document
    // to make sure the edit ranges for the remaining ones are stable
    if (a.range.start.line === b.range.start.line) {
      // console.debug("a and b are on the same line");
      return b.range.start.character - a.range.start.character;
    }
    // console.debug("a and b are on different lines");
    return b.range.start.line - a.range.start.line;
  });

  console.debug("neovimEdit() [sorted]:");
  for (const edit of edits) {
    console.debug(
      `\trange=${JSON.stringify(edit.range)}, text='${edit.text}', isReplace=${edit.isReplace}`,
    );
  }
  const document = neovimIDE.getTextDocument(
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

  getNeovimRegistry().emitEvent("onDidChangeTextDocument", {
    document: document,
    contentChanges: changes,
  });

  for (const edit of edits) {
    const { range, text, isReplace } = edit;

    if (text === "") {
      await neovimDelete(client, range);
    } else if (range.isEmpty && !isReplace) {
      await neovimInsert(client, range.start, text);
    } else {
      await neovimReplace(client, range, text);
    }
  }

  await neovimIDE.updateTextEditor();
  return true;
}

async function neovimDelete(client: NeovimClient, range: Range): Promise<void> {
  console.debug(`neovimDelete(): range=${JSON.stringify(range)}`);
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
  if (range.start.character <= firstLine.length) {
    // if we are deleting from before the end of the first line, we need to append the last line to the first line
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

async function neovimInsert(
  client: NeovimClient,
  position: Position,
  text: string,
) {
  console.debug(
    `neovimInsert(): position=${JSON.stringify(position)}, text='${text}'`,
  );
  // standardise newlines so we can easily split the lines
  const newLines = text.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

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
  if (newLines.length === 1) {
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

async function neovimReplace(client: NeovimClient, range: Range, text: string) {
  console.debug(
    `neovimReplace(): range=${JSON.stringify(range)}, text='${text}'`,
  );
  await neovimDelete(client, range);
  await neovimInsert(client, range.start, text);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isDelete(edit: Edit): boolean {
  return edit.text === "";
}

function isInsert(edit: Edit): boolean {
  return edit.range.isEmpty && !edit.isReplace;
}

function isReplace(edit: Edit): boolean {
  return (
    edit.text !== "" && (!edit.range.isEmpty || edit.isReplace ? true : false)
  );
}
