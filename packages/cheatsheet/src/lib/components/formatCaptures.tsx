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
      <span
        key={i}
        className="inline-block rounded-md bg-[#8686864C] p-[2px] text-[#000000E3] dark:bg-[#FFFFFF33] dark:text-[#FFFFFFE3]"
      >
        <SmartLink to="#legend" noFormatting={true}>
          {"["}
          {innerElement}
          {"]"}
        </SmartLink>
      </span>
    );
  });
}
const captureRegex = /<([^>]+)>/g;
