import { Edit, Position, Range } from "@cursorless/common";
import { Window } from "neovim";
import { updateTextEditor } from "../../neovimHelpers";
import { neovimContext } from "../../singletons/context.singleton";

export default async function neovimEdit(
  editor: Window,
  edits: Edit[],
): Promise<boolean> {
  // TODO: bring row three after four (test it)

  // We start applying the edits from the end of the document
  // to make sure the edit ranges for the remaining one are stable
  edits.reverse();
  edits.sort((a, b) => {
    if (a.range.start.line === b.range.start.line) {
      return b.range.start.character - a.range.start.character;
    }
    return b.range.start.line - a.range.start.line;
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

  await updateTextEditor();
  return true;
}

async function neovimDelete(range: Range): Promise<void> {
  const client = neovimContext().client;
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

  // are we only modifying one line?
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
  // Uniform newlines so we can easily split
  const newLines = text.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

  const client = neovimContext().client;
  const buffer = await client.window.buffer;

  // are we inserting at the beginning of a line?
  if (position.character === 0) {
    await buffer.insert(newLines, position.line);
    return;
  }

  // we are inserting from the middle of a line
  const firstLine = (
    await buffer.getLines({
      start: position.line,
      end: position.line + 1,
      strictIndexing: true,
    })
  )[0];
  const newFirstLine =
    firstLine.slice(0, position.character) +
    newLines[0] +
    firstLine.slice(position.character);

  await buffer.setLines([newFirstLine, ...newLines.slice(1)], {
    start: position.line,
    end: position.line + 1,
    strictIndexing: true,
  });
}

async function neovimReplace(range: Range, text: string) {
  await neovimDelete(range);
  await neovimInsert(range.start, text);
}