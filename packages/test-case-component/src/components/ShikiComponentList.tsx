import * as React from "react";
import { ShikiComponent } from "./shikiComponent";
import "../shiki.css";
import "../styles.css";
import type { TestCaseFixture } from "@cursorless/common";
import { testCasesByLanguage } from "../data";

export type ShikiComponentComponentProps = TestCaseFixture & {
  filename: string;
  raw: TestCaseFixture;
  before: { html: string; data: string[] };
  during: { html: string; data: string[] };
  after: { html: string; data: string[] };
};

export function ShikiComponentList({
  language,
  debug,
}: {
  language: string;
  debug?: boolean;
}) {
  if (!(language in testCasesByLanguage)) {
    console.warn(
      `Valid languages: ${Object.keys(testCasesByLanguage).join(", ")}`,
    );
    return <></>;
  }
  const rawData =
    (testCasesByLanguage as { [key: string]: unknown[] })[language] ?? [];
  const data: ShikiComponentComponentProps[] =
    rawData as ShikiComponentComponentProps[];

  return (
    <section className="dark:text-stone-100">
      {data.map((item) => {
        if (!item) {
          return <p>Error: item is null</p>;
        }
        const { filename } = item;
        if (filename) {
          return (
            <ShikiComponent data={item} debug={debug} key={item.filename} />
          );
        } else {
          return <></>;
        }
      })}
    </section>
  );
}
