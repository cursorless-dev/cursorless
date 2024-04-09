import * as React from "react";
import { ShikiComponent } from './components/component-shiki'

export const TestCaseComponentPage: React.FC<{ data: any }> = ({ data }) => {
  return (
    <main className="dark:text-stone-100">
      <h1 className="mb-1 mt-2 text-center text-2xl md:text-3xl xl:mt-4">
        Test Component Sheet{" "}
        <small className="block text-sm">
          See the{" "}
          {/* <SmartLink to={"https://www.cursorless.org/docs/"}> */}
            full documentation
          {/* </SmartLink>{" "} */}
          to learn more.
        </small>
      </h1>
      { data.map( (item:any) => <ShikiComponent data={item} /> ) }
      <p className="mb-1 mt-2 text-center text-base xl:mt-4">This is just to get the page working with an initial render before adding any more functionality</p>
    </main>
  );
};
