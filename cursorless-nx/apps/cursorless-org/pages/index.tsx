import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  return (
    <main className=" items-center justify-center bg-salmon-100 dark:bg-salmon-900 text-salmon-900 dark:text-salmon-300 overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 md:px-16 md:pt-8 md:pb-4 font-mono">
      <div className="h-full flex flex-col max-w-5xl m-auto max-h-[1000px]">
        <div className="flex-1 flex flex-col">
          <header className="flex flex-row items-center">
            <div className="mr-auto text-2xl font-semibold dark:font-medium tracking-[0.3em] md:text-4xl md:font-medium md:tracking-[0.24em] uppercase">
              Cursorless
            </div>
            <Logo
              title="Logo"
              className="align-middle md:scale-[2] md:mt-[0.5em]"
            />
          </header>
          <Slogan />
        </div>
        <div className="border md:border-2 border-salmon-300 rounded-sm p-[1px]">
          <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row justify-around w-full my-auto">
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
    <h1 className="text-[22px] leading-6 font-semibold dark:font-medium tracking-[0.06em] md:text-2xl md:leading-normal md:font-medium md:tracking-[0.3em] text-black dark:text-salmon-100 text-center my-auto">
      <span className="inline-block">Voice coding at the</span>{' '}
      <span className="inline-block">speed of thought.</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-salmon-800 dark:text-salmon-100 text-sm tracking-widest ">
      This site is powered by{' '}
      <a
        href="https://www.netlify.com/"
        target="_blank"
        className="text-salmon-400 dark:text-salmon-300 hover:text-purple-500 "
        rel="noreferrer"
      >
        Netlify
      </a>
      .
    </footer>
  );
}
