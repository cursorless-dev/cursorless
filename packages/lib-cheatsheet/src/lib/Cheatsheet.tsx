import { useEffect } from "preact/hooks";
import { QuestionCircleFill } from "react-bootstrap-icons";
import "./cheatsheet.css";
import type { CheatsheetInfo } from "./cheatsheet.types";
import { CheatsheetLegendSection } from "./CheatsheetLegendSection";
import { CheatsheetListSection } from "./CheatsheetListSection";
import { CheatsheetNotesSection } from "./CheatsheetNotesSection";
import { applyBootstrapTheme } from "./utils/applyBootstrapTheme";
import { cheatsheetLegendData } from "./utils/cheatsheetLegendData";
import { SmartLink } from "./utils/SmartLink";

type Props = {
  cheatsheetInfo: CheatsheetInfo;
};

export function Cheatsheet({ cheatsheetInfo }: Props) {
  useEffect(() => {
    return applyBootstrapTheme();
  }, []);

  return (
    <main className="cheatsheet">
      <div className="container-xxl pb-2">
        <Title />
        <CheatsheetSections cheatsheetInfo={cheatsheetInfo} />
      </div>
    </main>
  );
}

function Title() {
  return (
    <div className="col-12 text-center mb-3">
      <h1>
        Cursorless Cheatsheet{" "}
        <SmartLink to="#legend">
          <QuestionCircleFill className="question-icon" />
        </SmartLink>
        <small>
          See the{" "}
          <SmartLink to="https://www.cursorless.org/docs">
            full documentation
          </SmartLink>{" "}
          to learn more.
        </small>
      </h1>
    </div>
  );
}

function CheatsheetSections({ cheatsheetInfo }: Props) {
  return (
    <div className="cheatsheet-sections">
      {cheatsheetInfo.sections
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <CheatsheetListSection key={section.id} section={section} />
        ))}
      <CheatsheetLegendSection data={cheatsheetLegendData} />
      <CheatsheetNotesSection />
    </div>
  );
}
