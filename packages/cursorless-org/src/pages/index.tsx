import { EmbeddedVideo } from "../components/embedded-video";
import Head from "next/head";
import Button from "../components/Button";
import { TITLE, YOUTUBE_SLUG } from "../components/constants";
import IndexSocial from "../components/IndexSocial";
import Logo from "./logo.svg";

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return { props: { bodyClasses: "bg-salmon-100 dark:bg-salmon-900" } };
}

export default function LandingPage() {
  const smallScaling = "sm:w-sm-base sm:h-sm-base sm:text-sm-base";
  const stretchedScaling =
    "sm:stretched:w-stretched-base sm:stretched:h-stretched-base sm:stretched:text-stretched-base";

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <IndexSocial />
      </Head>
      <main className="text-salmon-900 dark:text-salmon-100 font-mono-wide fixed bottom-0 left-0 right-0 top-0 items-center justify-center overflow-auto p-2 font-bold tracking-[0.18em] sm:flex sm:p-0">
        {/*
        Note that the font scale gets applied to this element so that all nested elements can use
        `em` units and will automatically be scaled.
        FIXME: We should probably add the font size to the root element so that we can use `rem`
        units instead
        */}
        <div
          className={`flex h-full flex-col text-[10px] sm:m-auto ${smallScaling} ${stretchedScaling}`}
        >
          <div className="flex flex-1 flex-col">
            <header className="flex flex-row items-center">
              <div className="mr-auto align-middle text-2xl uppercase">
                Cursorless
              </div>
              <Logo
                title="Logo"
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
            <NetlifyFooter />
          </div>
        </div>
      </main>
    </>
  );
}

function Slogan() {
  return (
    <h1 className="my-auto text-center text-lg uppercase leading-[1.048888]">
      <span className="inline-block">Voice coding</span>{" "}
      <span className="inline-block">at the speed of thought</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-xs font-light tracking-widest">
      <span className="uppercase dark:opacity-50">
        This site is powered by{" "}
      </span>
      <a
        href="https://www.netlify.com/"
        target="_blank"
        className="text-salmon-400 hover:text-salmon-300"
        rel="noreferrer"
      >
        Netlify
      </a>
      .
    </footer>
  );
}
