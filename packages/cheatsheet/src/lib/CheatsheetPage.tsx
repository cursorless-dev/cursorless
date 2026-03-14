import * as React from "react";
import CheatsheetListComponent from "./components/CheatsheetListComponent";
import CheatsheetLegendComponent from "./components/CheatsheetLegendComponent";
import cheatsheetLegend from "./cheatsheetLegend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons/faCircleQuestion";
import CheatsheetNotesComponent from "./components/CheatsheetNotesComponent";
import SmartLink from "./components/SmartLink";
import type { CheatsheetInfo } from "./CheatsheetInfo";

type Props = {
  cheatsheetInfo: CheatsheetInfo;
};

export function CheatsheetPage({ cheatsheetInfo }: Props) {
  return (
    <main className="bg-stone-50 pt-2 dark:bg-stone-800 dark:text-stone-100">
      <h1 className="mb-1 text-center text-2xl md:text-3xl xl:mt-4">
        Cursorless Cheatsheet{" "}
        <span className="inline-block align-middle text-sm">
          <SmartLink to="#legend">
            <FontAwesomeIcon icon={faCircleQuestion} />
          </SmartLink>
        </span>
        <small className="block text-sm">
          See the{" "}
          <SmartLink to={"https://www.cursorless.org/docs/"}>
            full documentation
          </SmartLink>{" "}
          to learn more.
        </small>
      </h1>
      <Cheatsheet cheatsheetInfo={cheatsheetInfo} />
    </main>
  );
}

function Cheatsheet({ cheatsheetInfo }: Props) {
  return (
    <div className="columns-1 gap-2 p-2 md:columns-2 md:gap-3 md:p-3 xl:mx-auto xl:max-w-[1600px] xl:columns-3 xl:gap-4 xl:p-4">
      {cheatsheetInfo.sections
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <CheatsheetSection key={section.id}>
            <CheatsheetListComponent section={section} />
          </CheatsheetSection>
        ))}
      <CheatsheetSection>
        <CheatsheetLegendComponent data={cheatsheetLegend} />
      </CheatsheetSection>
      <CheatsheetSection>
        <CheatsheetNotesComponent />
      </CheatsheetSection>
    </div>
  );
}

type CheatsheetSectionProps = {
  children?: React.ReactNode;
};

function CheatsheetSection({ children }: CheatsheetSectionProps) {
  return (
    <section className="mb-5 break-inside-avoid last:mb-0 md:mb-3 xl:mb-4">
      {children}
    </section>
  );
}
