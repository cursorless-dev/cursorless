import { Edit } from "@cursorless/common";
import { Window } from "neovim";
import { updateTextEditor } from "../../neovimHelpers";
import { neovimContext } from "../../singletons/context.singleton";

export default async function neovimEdit(
  editor: Window,
  edits: Edit[],
): Promise<boolean> {
  const client = neovimContext().client;
  const buffer = await client.window.buffer;

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
    // Uniform newlines so we can easily split
    const newlines = text.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

    if (text === "") {
      // --- Delete

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
        const singleLine =
          lastLine.slice(0, range.start.character) + endOfLastLine;
        // update that single line
        await buffer.setLines(singleLine, {
          start: range.start.line,
          end: range.start.line + 1,
          strictIndexing: true,
        });
      } else {
        if (range.start.character === 0) {
          // if we are deleting from the start of the first line, we need to exclude the first line
          await buffer.setLines(endOfLastLine, {
            start: range.start.line,
            end: range.end.line + 1,
            strictIndexing: true,
          });
        } else {
          // only keep the beginning of the first line
          const firstLine = (
            await buffer.getLines({
              start: range.start.line,
              end: range.start.line + 1,
              strictIndexing: true,
            })
          )[0];
          const startOfFirstLine = firstLine.slice(0, range.start.character);
          if (range.start.character === firstLine.length) {
            // if we are deleting from the end of the first line, we need to append the last line to the first line
            await buffer.setLines(startOfFirstLine + endOfLastLine, {
              start: range.start.line,
              end: range.end.line + 1,
              strictIndexing: true,
            });
            continue;
          }
          await buffer.setLines([startOfFirstLine, endOfLastLine], {
            start: range.start.line,
            end: range.end.line + 1,
            strictIndexing: true,
          });
        }
      }
    } else if (range.isEmpty && !isReplace) {
      // --- Insert
      throw Error("neovimEdit(): Insert not implemented");
    } else {
      // --- Replace
      throw Error("neovimEdit(): Replace not implemented");
    }
  }

  // TODO: update our view of the TextEditor/TextDocument
  await updateTextEditor();
  return true;
}
