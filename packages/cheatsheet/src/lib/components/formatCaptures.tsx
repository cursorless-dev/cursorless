import reactStringReplace from "react-string-replace";
import SmartLink from "./SmartLink";

export function formatCaptures(input: string) {
  return reactStringReplace(input, captureRegex, (match, i) => {
    const innerElement =
      match === "ordinal" ? (
        <span>
          n<sup>th</sup>
        </span>
      ) : (
        match
      );

    return (
      <span className="inline-block p-[2px] rounded-md text-[#000000E3] dark:text-[#FFFFFFE3] bg-[#8686864C] dark:bg-[#FFFFFF33]">
        <SmartLink key={i} to="#legend" noFormatting={true}>
          {"["}
          {innerElement}
          {"]"}
        </SmartLink>
      </span>
    );
  });
}
const captureRegex = /<([^>]+)>/g;
