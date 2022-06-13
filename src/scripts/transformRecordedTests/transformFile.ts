import { promises as fsp } from "fs";
import * as yaml from "js-yaml";
import { TestCaseFixture } from "../../testUtil/TestCase";
import serialize from "../../testUtil/serialize";
import { FixtureTransformation } from "./types";

export async function transformFile(
  transformation: FixtureTransformation,
  file: string
) {
  const buffer = await fsp.readFile(file);
  const inputFixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const outputFixture = transformation(inputFixture);
  await fsp.writeFile(file, serialize(outputFixture));
}
