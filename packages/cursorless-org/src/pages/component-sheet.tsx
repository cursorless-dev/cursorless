import * as yaml from "js-yaml";
import fs from "fs";
import path from "path";
import Head from "next/head";

import { loadTestCaseFixture } from "@cursorless/test-case-component";
import { TestCaseComponentPage } from "@cursorless/test-case-component";
import type { TestCaseFixture } from "@cursorless/common";
import { testSelectedFiles } from "./allowList";

import { cheatsheetBodyClasses } from "@cursorless/cheatsheet";

const fixturesDir = path.join("../", "../", "data", "example-files");

async function loadYamlFiles(dir: string, allowList?: string[]) {
  const directoryPath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(directoryPath);
  const data: any[] = [];

  files.forEach((file) => {
    if (
      path.extname(file) === ".yml" &&
      (!allowList || allowList.includes(file))
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

// Change argument to a single object for loadAndProcessFixtures
interface LoadAndProcessFixturesOptions {
  fixturesDir: string;
  allowList?: string[];
}

/**
 * Loads YAML test case files from a directory, processes them into fixtures, and returns an array of processed test case data.
 * Optionally filters which files to load using an allow list.
 *
 * @param {Object} options - Options for loading and processing fixtures.
 * @param {string} options.fixturesDir - Directory containing YAML fixture files.
 * @param {string[]=} options.allowList - Optional list of filenames to include.
 * @returns {Promise<any[]>} Array of processed test case data, each with a `raw` property containing the original YAML object.
 */
async function loadAndProcessFixtures({
  fixturesDir,
  allowList,
}: LoadAndProcessFixturesOptions) {
  const dataActions = await loadYamlFiles(fixturesDir, allowList);
  const data_errors: any[] = [];

  const data = (
    await Promise.all(
      dataActions.map(async (val) => {
        try {
          const fixture = await loadTestCaseFixture(val);
          return { ...fixture, raw: val };
        } catch (err) {
          console.error(err);
          data_errors.push(val);
          return null;
        }
      }),
    )
  ).filter((test) => test != null);

  if (data_errors.length > 0) {
    console.error("data errors:", data_errors);
  }

  return data;
}

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  const data = await loadAndProcessFixtures({
    fixturesDir,
    allowList: testSelectedFiles,
  });
  return { props: { data, bodyClasses: cheatsheetBodyClasses } };
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
  data,
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
      <TestCaseComponentPage data={data} debug={debug} />
    </>
  );
}

export default App;
