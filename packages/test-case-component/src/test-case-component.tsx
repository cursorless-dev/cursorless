import * as React from "react";
import { ShikiComponent } from "./components/component-shiki";
import "./shiki.css";
import "./styles.css";

export const TestCaseComponentPage: React.FC<{ data: any; loaded: any }> = ({
  data,
  loaded,
}) => {
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

      {loaded.map((item: any) => (
        <ShikiComponent data={item} key={item.filename} />
      ))}
    </main>
  );
};
