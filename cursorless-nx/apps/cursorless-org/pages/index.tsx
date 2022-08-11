import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  return (
    <main className="bg-salmon-100 dark:bg-salmon-900 overflow-auto fixed top-0 bottom-0 left-0 right-0 p-8 md:p-16 text-salmon-900 dark:text-salmon-300 font-mono">
      <div className="h-full flex flex-col justify-between">
        <header className="flex flex-row items-center">
          <div className="mr-auto text-2xl md:text-5xl uppercase place-content-center font-medium tracking-[0.22em]">
            Cursorless
          </div>
          <Logo
            title="Logo"
            className="align-middle md:scale-[2] md:mt-[0.5em]"
          />
        </header>
        <h1 className="text-xl sm:text-2xl md:text-4xl dark:text-salmon-200 text-center tracking-[0.06em] md:font-semibold ">
          Voice coding at the speed of thought.
        </h1>
        <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        <div className="flex flex-row justify-between w-full">
          <a
            href="/docs"
            className="border border-salmon-900 dark:border-salmon-300 bg-salmon-50 dark:bg-black rounded font-semibold text-lg px-[50px] py-[13px]"
          >
            Start
          </a>
          <a
            href="https://github.com/sponsors/pokey"
            className="border border-salmon-900 dark:border-salmon-300 bg-salmon-50 dark:bg-black rounded font-semibold text-lg px-[50px] py-[13px]"
            target="_blank"
            rel="noreferrer"
          >
            Donate
          </a>
        </div>
        <footer className="text-center text-sm md:text-xl tracking-widest">
          This site is powered by{' '}
          <a
            href="https://www.netlify.com/"
            target="_blank"
            className="text-blue-500 hover:text-purple-500"
            rel="noreferrer"
          >
            Netlify
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
