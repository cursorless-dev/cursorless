import {
  cheatsheetBodyClasses,
  CheatsheetPage,
  defaultCheatsheetInfo,
} from "@cursorless/cheatsheet";

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return { props: { bodyClasses: cheatsheetBodyClasses } };
}

export function App() {
  return <CheatsheetPage cheatsheetInfo={defaultCheatsheetInfo} />;
}

export default App;
