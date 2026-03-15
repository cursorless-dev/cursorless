import { EmbeddedVideo } from "./embedded-video";
import { Button } from "./Button";
import { EmbeddedVideo } from "./EmbeddedVideo";
import { TITLE, YOUTUBE_SLUG } from "./constants";
import Logo from "./logo.svg?react";

export function LandingPage() {
  const smallScaling = "sm:w-sm-base sm:h-sm-base sm:text-sm-base";

  return (
    <>
      <title>{TITLE}</title>
          <div className="d-flex flex-grow-1 flex-column">
            <header className="d-flex align-items-center">
                Cursorless
              </div>
              <Logo
                title="Cursorless logo"
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
      <span className="d-inline-block">Voice coding</span>{" "}
      <span className="d-inline-block">at the speed of thought</span>
    </h1>
  );
}
