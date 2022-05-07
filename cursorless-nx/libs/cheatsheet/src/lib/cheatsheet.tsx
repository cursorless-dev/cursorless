import * as React from "react";
import cheatsheetInfo from "../data/cheatsheet/defaults.json";
import CheatsheetListComponent from "./components/CheatsheetListComponent";
import CheatsheetLegendComponent from "./components/CheatsheetLegendComponent";
import cheatsheetLegend from "./cheatsheetLegend";
import Helmet from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import CheatsheetNotesComponent from "./components/CheatsheetNotesComponent";
import SmartLink from "./components/SmartLink";

// markup
const CheatsheetPage = () => {
  return (
    <main className="dark:text-stone-100">
      <Helmet
        bodyAttributes={{
          class: "bg-stone-50 dark:bg-stone-800",
        }}
      />
      <h1 className="text-2xl md:text-3xl text-center mt-2 mb-1 xl:mt-4">
        Cursorless Cheatsheet{" "}
        <span className="text-sm inline-block align-middle">
          <SmartLink to="#legend">
            <FontAwesomeIcon icon={faCircleQuestion} />
          </SmartLink>
        </span>
      </h1>
      <Cheatsheet />
    </main>
  );
};

const Cheatsheet = () => (
  <div className="p-2 gap-2 xl:p-4 xl:gap-4 columns-1 md:columns-2 xl:columns-3 xl:max-w-[1600px] xl:mx-auto">
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

const CheatsheetSection: React.FC<{}> = ({ children }) => (
  <section className=" break-inside-avoid mb-2 xl:mb-4 ">{children}</section>
);

export default CheatsheetPage;
