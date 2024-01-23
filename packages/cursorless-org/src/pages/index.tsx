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
  const smallScaling = "sm:w-smBase sm:h-smBase sm:text-smBase";
  const stretchedScaling =
    "sm:stretched:w-stretchedBase sm:stretched:h-stretchedBase sm:stretched:text-stretchedBase";

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <IndexSocial />
      </Head>
      <main className="items-center justify-center text-salmon-900 dark:text-salmon-100 font-monoWide font-bold tracking-[0.18em] overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 sm:p-0 sm:flex ">
        {/*
        Note that the font scale gets applied to this element so that all nested elements can use
        `em` units and will automatically be scaled.
        FIXME: We should probably add the font size to the root element so that we can use `rem`
        units instead
        */}
        <div
          className={`h-full flex flex-col text-[10px] sm:m-auto ${smallScaling} ${stretchedScaling}`}
        >
          <div className="flex-1 flex flex-col">
            <header className="flex flex-row items-center ">
              <div className="align-middle mr-auto text-2xl uppercase">
                Cursorless
              </div>
              <Logo
                title="Logo"
                className="align-middle w-[30px] h-[30px] sm:w-[4em] sm:h-[4em]"
              />
            </header>
            <Slogan />
          </div>
          <div className="border-[0.5px] border-salmon-100 p-[1px]">
            <EmbeddedVideo youtubeSlug={YOUTUBE_SLUG} />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex flex-row justify-around sm:justify-center w-full my-auto sm:gap-[12.8em]">
              <Button text="Docs" href="/docs" isExternal={false} />{" "}
              <Button
                text="Donate"
                href="https://github.com/sponsors/pokey"
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
    <h1 className="text-lg leading-[1.048888] uppercase text-center my-auto">
      <span className="inline-block">Voice coding</span>{" "}
      <span className="inline-block">at the speed of thought</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-xs tracking-widest font-light">
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
