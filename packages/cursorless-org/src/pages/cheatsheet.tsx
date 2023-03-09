import {
  cheatsheetBodyClasses,
  CheatsheetPage,
  defaultCheatsheetInfo,
} from "@cursorless/cheatsheet";

export async function getStaticProps() {
  return { props: { bodyClasses: cheatsheetBodyClasses } };
}

export function App() {
  return <CheatsheetPage cheatsheetInfo={defaultCheatsheetInfo} />;
}

export default App;
