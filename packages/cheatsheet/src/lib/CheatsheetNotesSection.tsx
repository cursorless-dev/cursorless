import type { JSX } from "preact";
import SmartLink from "./utils/SmartLink";

export default function CheatsheetNotesSection(): JSX.Element {
  return (
    <section id="notes" className="text-center">
      See the{" "}
      <SmartLink to={"https://www.cursorless.org/docs/"}>
        full documentation
      </SmartLink>{" "}
      to learn more.
    </section>
  );
}
