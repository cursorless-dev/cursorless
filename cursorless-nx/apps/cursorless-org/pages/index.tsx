import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  return (
    <main className=" items-center justify-center bg-salmon-100 dark:bg-salmon-900 text-salmon-900 dark:text-salmon-300 overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 md:px-16 md:pt-32 md:pb-4 font-mono">
      <div className="h-full md:h-fit flex flex-col max-w-[1000px] mx-auto">
        <div className="flex-1 flex flex-col">
          <header className="flex flex-row items-center md:mb-[39px]">
            <div className="mr-auto text-2xl md:text-[32px] md:leading-[34px] font-semibold dark:font-medium md:font-medium tracking-[0.3em] md:tracking-[0.24em] uppercase">
              Cursorless
            </div>
            <Logo
              title="Logo"
              className="align-middle scale-[0.961] md:scale-[1.2] md:mt-[0.5em]"
            />
          </header>
          <Slogan />
        </div>
        <div className="border border-salmon-300 md:border-salmon-100 rounded-sm p-[1px] md:mb-8">
          <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row justify-around md:justify-center w-full my-auto md:mb-6 md:gap-32">
            <Button text="Start" href="/docs" isExternal={true} />{' '}
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
  );
}

function Slogan() {
  return (
    <h1 className="text-[22px] md:text-sm leading-6 md:leading-normal font-semibold dark:font-medium md:font-medium tracking-[0.06em] md:tracking-[0.24em] text-black dark:text-salmon-100 text-center my-auto md:mb-[45px]">
      <span className="inline-block">Voice coding at the</span>{' '}
      <span className="inline-block">speed of thought.</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-salmon-800 dark:text-salmon-100 dark:md:text-salmon-300 text-sm md:text-xs tracking-widest ">
      This site is powered by{' '}
      <a
        href="https://www.netlify.com/"
        target="_blank"
        className="text-salmon-400 dark:text-salmon-300 dark:md:text-salmon-400 hover:text-purple-500 "
        rel="noreferrer"
      >
        Netlify
      </a>
      .
    </footer>
  );
}
