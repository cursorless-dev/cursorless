import * as yaml from "js-yaml";
import fs from "fs";
import path from "path";
import Head from "next/head";

import {
  loadFixture,
} from "@cursorless/test-case-component";
import { TestCaseComponentPage } from "@cursorless/test-case-component";
import type { TestCaseFixture } from "@cursorless/common";
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

  const dataActions = await loadYamlFiles(itemsDirActions, testSelectedFiles);
  const dataDecorations = await loadYamlFiles(
    itemsDirDecorations,
    testSelectedFiles,
  );

  const data = (
    await Promise.all(
      [...dataActions, ...dataDecorations].map((val) => {
        return loadFixture(val);
      }),
    )
  ).filter((val) => val !== undefined);

  return { props: { data, bodyClasses: cheatsheetBodyClasses } };
}

export function App({ data }: { data: TestCaseFixture[] }) {
  return (
    <>
      <Head>
        <title>Cursorless Test Case Component Page</title>
      </Head>
      <TestCaseComponentPage data={data} />
    </>
  );
}

export default App;
