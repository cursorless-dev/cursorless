import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  return (
    <main className="bg-salmon-100 dark:bg-salmon-900 overflow-auto fixed top-0 bottom-0 left-0 right-0 px-3 py-8 md:p-16 text-salmon-900 dark:text-salmon-300 font-mono">
      <div className="h-full flex flex-col ">
        <div className="flex-1 flex flex-col px-5">
          <header className="flex flex-row items-center">
            <div className="mr-auto text-2xl md:text-5xl uppercase place-content-center font-medium tracking-[0.22em]">
              Cursorless
            </div>
            <Logo
              title="Logo"
              className="align-middle md:scale-[2] md:mt-[0.5em]"
            />
          </header>
          <h1 className="text-2xl md:text-4xl font-semibold dark:text-salmon-200 text-center tracking-[0.06em] md:font-semibold my-auto">
            <span className="inline-block">Voice coding at the</span>{' '}
            <span className="inline-block">speed of thought.</span>
          </h1>
        </div>
        <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        <div className="flex-1 flex flex-col px-5">
          <div className="flex flex-row justify-between w-full my-auto">
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

function NetlifyFooter() {
  return (
    <footer className="text-center text-sm md:text-xl tracking-widest ">
      This site is powered by{' '}
      <a
        href="https://www.netlify.com/"
        target="_blank"
        className="text-blue-500 hover:text-purple-500 "
        rel="noreferrer"
      >
        Netlify
      </a>
      .
    </footer>
  );
}
