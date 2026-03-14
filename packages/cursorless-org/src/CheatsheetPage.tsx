import {
  CheatsheetPage as OriginalCheatsheetPage,
  defaultCheatsheetInfo,
} from "@cursorless/cheatsheet";

export function CheatsheetPage() {
  return (
    <>
      <title>Cursorless cheatsheet</title>
      <OriginalCheatsheetPage cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
