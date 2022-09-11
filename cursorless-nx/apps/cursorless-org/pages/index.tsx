import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  const smallScaling = 'sm:w-smBase sm:h-smBase sm:text-smBase';
  const stretchedScaling =
    'sm:stretched:w-stretchedBase sm:stretched:h-stretchedBase sm:stretched:text-stretchedBase';

  return (
    <main className="items-center justify-center bg-salmon-100 dark:bg-salmon-900 text-salmon-900 dark:text-salmon-100 overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 sm:p-0 sm:flex font-mono">
      <div
        className={`h-full flex flex-col sm:m-auto ${smallScaling} ${stretchedScaling}`}
      >
        <div className="flex-1 flex flex-col">
          <header className="flex flex-row items-center ">
            <div className="align-middle mr-auto text-2xl sm:text-[3.2em] sm:leading-[34px] font-semibold dark:font-medium sm:font-medium tracking-[0.3em] sm:tracking-[0.24em] uppercase">
              Cursorless
            </div>
            <Logo
              title="Logo"
              className="align-middle w-[29px] h-[29px] sm:w-[4em] sm:h-[4em]"
            />
          </header>
          <Slogan />
        </div>
        <div className="border-[0.5px] border-salmon-100 sm:border-salmon-100 p-[1px]">
          <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row justify-around sm:justify-center w-full my-auto sm:gap-32">
            <Button text="Start" href="/docs" isExternal={false} />{' '}
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
    <h1 className="text-[22px] sm:text-[2em] leading-6 sm:leading-normal font-semibold sm:font-semibold uppercase [font-stretch:112.5%] tracking-[0.06em] sm:tracking-[0.24em] text-black dark:text-salmon-100 text-center my-auto">
      <span className="inline-block">Voice coding</span>{' '}
      <span className="inline-block">at the speed of thought</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-sm sm:text-[1.2em] tracking-widest font-light">
      <span className="uppercase text-salmon-800 dark:text-salmon-100 dark:opacity-50">
        This site is powered by{' '}
      </span>
      <a
        href="https://www.netlify.com/"
        target="_blank"
        className="text-salmon-400 hover:text-purple-500 "
        rel="noreferrer"
      >
        Netlify
      </a>
      .
    </footer>
  );
}
