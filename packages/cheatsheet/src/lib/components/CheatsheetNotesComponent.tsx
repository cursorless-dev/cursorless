import * as React from "react";
import SmartLink from "./SmartLink";

export default function CheatsheetNotesComponent(): JSX.Element {
  return (
    <div
      id="notes"
      className="overflow-hidden rounded-lg border border-violet-300 bg-violet-100 p-2 dark:border-violet-500 dark:bg-violet-900"
    >
      <h2 className="mb-1 text-center text-xl text-violet-900 dark:text-violet-100">
        Notes
      </h2>
      <ul>
        <li className="">
          See the{" "}
          <SmartLink to={"https://www.cursorless.org/docs/"}>
            full documentation
          </SmartLink>{" "}
          to learn more.
        </li>
      </ul>
    </div>
  );
}
