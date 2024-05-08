import {
  TestCaseComponentPage
} from "@cursorless/test-case-component";

import {
  cheatsheetBodyClasses,
} from "@cursorless/cheatsheet";

import * as yaml from "js-yaml";
import fs from 'fs';
import path from 'path';

import Head from "next/head";

const fixturesDir = path.join(
  "../",
  "../",
  "data",
  "fixtures",
  "recorded",
);

async function loadYamlFiles(dir: string, selectedFiles?: string[]) {

  const directoryPath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(directoryPath);
  const data: any[] = [];

  files.forEach(file => {
    if(path.extname(file) === '.yml' && (!selectedFiles || selectedFiles.includes(file))) {
      const filePath = path.join(directoryPath, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const yamlData: any = yaml.load(fileContents);
      data.push(yamlData);
    }
  });

  console.log(dir, "files:", files)
  console.log("data:", data);

  return data;
}

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  const itemsDir = (path.join(fixturesDir, 'actions'))
  const testSelectedFiles = [
    "bringArgMadeAfterLook.yml", 
    "chuckBlockAirUntilBatt.yml", 
    "cutFine.yml", 
    "chuckLineFine.yml", 
    "bringAirAndBatAndCapToAfterItemEach.yml"
  ]
  const data = await loadYamlFiles(itemsDir, testSelectedFiles);

  return { props: { data: data, bodyClasses: cheatsheetBodyClasses } };
}

export function App({data} : { data:any }) {
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
