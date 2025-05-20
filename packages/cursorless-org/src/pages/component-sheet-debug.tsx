import * as yaml from "js-yaml";
import fs from "fs";
import path from "path";
import Head from "next/head";

import { loadTestCaseFixture } from "@cursorless/test-case-component";
import { TestCaseComponentPage } from "@cursorless/test-case-component";
import type { TestCaseComponentProps } from "@cursorless/test-case-component";
import { testSelectedFiles } from "./allowList";

import { cheatsheetBodyClasses } from "@cursorless/cheatsheet";

const fixturesDir = path.join("../", "../", "data", "fixtures", "recorded");

async function loadYamlFiles(dir: string, selectedFiles?: string[]) {
  const directoryPath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(directoryPath);
  const data: any[] = [];

  files.forEach((file) => {
    if (
      path.extname(file) === ".yml" &&
      (!selectedFiles || selectedFiles.includes(file))
    ) {
      try {
        const filePath = path.join(directoryPath, file);
        const fileContents = fs.readFileSync(filePath, "utf8");
        const yamlData: any = yaml.load(fileContents);
        yamlData.filename = file;
        data.push(yamlData);
      } catch {
        console.error("File load failure", file);
      }
    }
  });

  return data;
}

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  const itemsDirActions = path.join(fixturesDir, "actions");
  const itemsDirDecorations = path.join(fixturesDir, "decorations");
  const itemsDirInsertEmptyLines = path.join(
    fixturesDir,
    "actions/insertEmptyLines",
  );

  const dataActions = await loadYamlFiles(itemsDirActions, testSelectedFiles);
  const dataInsertEmptyLines = await loadYamlFiles(
    itemsDirInsertEmptyLines,
    testSelectedFiles,
  );

  const dataDecorations = await loadYamlFiles(
    itemsDirDecorations,
    testSelectedFiles,
  );

  const data_errors: any[] = [];

  const data = (
    await Promise.all(
      [...dataActions, ...dataDecorations, ...dataInsertEmptyLines].map(
        async (val) => {
          try {
            const fixture = await loadTestCaseFixture(val);
            return { ...fixture, raw: val };
          } catch (err) {
            console.error(err);
            data_errors.push(val);
            return null;
          }
        },
      ),
    )
  ).filter((test) => test !== undefined);

  if (data_errors.length > 0) {
    console.error("data errors:", data_errors);
  }

  return { props: { data, bodyClasses: cheatsheetBodyClasses } };
}

export function App({ data }: { data: TestCaseComponentProps[] }) {
  return (
    <>
      <Head>
        <title>Cursorless Test Case Component Page</title>
      </Head>
      <TestCaseComponentPage data={data} debug={true} />
    </>
  );
}

export default App;
