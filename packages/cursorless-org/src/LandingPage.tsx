import { EmbeddedVideo } from "./embedded-video";
import Button from "./Button";
import { TITLE, YOUTUBE_SLUG } from "./constants";
import IndexSocial from "./IndexSocial";
import logo from "./logo.svg?no-inline";

export function LandingPage() {
  const smallScaling = "sm:w-sm-base sm:h-sm-base sm:text-sm-base";

  return (
    <>
      <title>{TITLE}</title>
      <IndexSocial />
      <main className="bg-salmon-100 dark:bg-salmon-900 text-salmon-900 dark:text-salmon-100 font-mono-wide fixed top-0 right-0 bottom-0 left-0 items-center justify-center overflow-auto p-2 font-bold tracking-[0.18em] sm:flex sm:p-0">
        {/*
        Note that the font scale gets applied to this element so that all nested elements can use
        `em` units and will automatically be scaled.
        FIXME: We should probably add the font size to the root element so that we can use `rem`
        units instead
        */}
        <div
          className={`landing-page-scale flex h-full flex-col text-[10px] sm:m-auto ${smallScaling}`}
        >
          <div className="flex flex-1 flex-col">
            <header className="flex flex-row items-center">
              <div className="mr-auto align-middle text-2xl uppercase">
                Cursorless
              </div>
              <img
                src={logo}
                alt="Cursorless logo"
                className="h-[30px] w-[30px] align-middle sm:h-[4em] sm:w-[4em]"
              />
            </header>
            <Slogan />
          </div>
          <div className="border-salmon-100 border-[0.5px] p-px">
            <EmbeddedVideo youtubeSlug={YOUTUBE_SLUG} />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="my-auto flex w-full flex-row justify-around sm:justify-center sm:gap-[12.8em]">
              <Button text="Docs" href="/docs" isExternal={false} />{" "}
              <Button
                text="Donate"
                href="https://github.com/sponsors/cursorless-dev"
                isExternal={true}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Slogan() {
  return (
    <h1 className="my-auto text-center text-lg leading-[1.048888] uppercase">
      <span className="inline-block">Voice coding</span>{" "}
      <span className="inline-block">at the speed of thought</span>
    </h1>
  );
}
