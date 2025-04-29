import * as React from "react";
import { ShikiComponent } from "./shikiComponent";
import "../shiki.css";
import "../styles.css";
import type { TestCaseFixture } from "@cursorless/common";

export type TestCaseComponentProps = TestCaseFixture & {
  filename: string;
  raw: TestCaseFixture;
  before: string;
  during: string;
  after: string;
};

export function TestCaseComponentPage({
  data,
}: {
  data: TestCaseComponentProps[];
}) {
  return (
    <main className="dark:text-stone-100">
      <h1 className="mb-1 mt-2 text-center text-2xl md:text-3xl xl:mt-4">
        Test Component Sheet{" "}
        <small className="block text-sm">
          See the {/* <SmartLink to={"https://www.cursorless.org/docs/"}> */}
          full documentation
          {/* </SmartLink>{" "} */}
          to learn more.
        </small>
      </h1>

      {data.map((item: TestCaseComponentProps) => {
        if (!item) {
          return <p>Error: item is null</p>;
        }
        const { filename } = item;
        if (filename) {
          return <ShikiComponent data={item} key={item.filename} />;
        } else {
          return <></>;
        }
      })}
    </main>
  );
}
