import {
  CheatsheetPage as OriginalCheatsheetPage,
  defaultCheatsheetInfo,
} from "@cursorless/cheatsheet";

export function CheatsheetPage() {
  //   export const cheatsheetBodyClasses = "bg-stone-50 dark:bg-stone-800";

  return (
    <>
      <title>Cursorless cheatsheet</title>
      <OriginalCheatsheetPage cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
