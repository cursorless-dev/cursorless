import Head from "next/head";

import {
  ShikiComponentList,
  testCasesByLanguage,
} from "@cursorless/test-case-component";
import type { TestCaseFixture } from "@cursorless/common";
import { cheatsheetBodyClasses } from "@cursorless/cheatsheet";

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return { props: { bodyClasses: cheatsheetBodyClasses } };
}

export type TestCaseComponentProps = TestCaseFixture & {
  filename: string;
  raw: TestCaseFixture;
  before: { html: string; data: string[] };
  during: { html: string; data: string[] };
  after: { html: string; data: string[] };
  debug?: boolean;
};

export function App({
  debug,
}: {
  data: TestCaseComponentProps[];
  debug?: boolean;
}) {
  return (
    <>
      <Head>
        <title>Cursorless Test Case Component Page</title>
      </Head>
      {Object.keys(testCasesByLanguage).map((language) => (
        <ShikiComponentList key={language} language={language} debug={debug} />
      ))}
    </>
  );
}

export default App;
