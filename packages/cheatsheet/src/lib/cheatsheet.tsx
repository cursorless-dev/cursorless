import * as React from "react";
import CheatsheetListComponent from "./components/CheatsheetListComponent";
import CheatsheetLegendComponent from "./components/CheatsheetLegendComponent";
import cheatsheetLegend from "./cheatsheetLegend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons/faCircleQuestion";
import CheatsheetNotesComponent from "./components/CheatsheetNotesComponent";
import SmartLink from "./components/SmartLink";
import { CheatsheetInfo } from "./CheatsheetInfo";

type CheatsheetPageProps = {
  cheatsheetInfo: CheatsheetInfo;
};

export const CheatsheetPage: React.FC<CheatsheetPageProps> = ({
  cheatsheetInfo,
}) => {
  return (
    <main className="dark:text-stone-100">
      <h1 className="mb-1 mt-2 text-center text-2xl md:text-3xl xl:mt-4">
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
};

type CheatsheetProps = {
  cheatsheetInfo: CheatsheetInfo;
};

const Cheatsheet: React.FC<CheatsheetProps> = ({ cheatsheetInfo }) => (
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

type CheatsheetSectionProps = {
  children?: React.ReactNode;
};

const CheatsheetSection: React.FC<CheatsheetSectionProps> = ({ children }) => (
  <section className=" mb-5 break-inside-avoid last:mb-0 md:mb-3 xl:mb-4">
    {children}
  </section>
);
