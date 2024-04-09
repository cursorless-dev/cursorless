import {
  TestCaseComponentPage
} from "@cursorless/test-case-component";
import {
  cheatsheetBodyClasses,
} from "@cursorless/cheatsheet";

import Head from "next/head";

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return { props: { bodyClasses: cheatsheetBodyClasses } };
}

export function App() {
  return (
    <>
      <Head>
        <title>Cursorless cheatsheet</title>
      </Head>
      <TestCaseComponentPage />
    </>
  );
}

export default App;
