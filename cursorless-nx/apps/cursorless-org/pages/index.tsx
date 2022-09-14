import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';
import Head from 'next/head';

export default function LandingPage() {
  const smallScaling = 'sm:w-smBase sm:h-smBase sm:text-smBase';
  const stretchedScaling =
    'sm:stretched:w-stretchedBase sm:stretched:h-stretchedBase sm:stretched:text-stretchedBase';

  return (
    <main className="items-center justify-center text-salmon-900 dark:text-salmon-100 font-mono font-bold tracking-[0.18em] overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 sm:p-0 sm:flex ">
      <Head>
        <title>Cursorless: Voice coding at the speed of thought</title>
        <meta
          property="og:title"
          content="Cursorless: Voice coding at the speed of thought"
          key="title"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
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
          <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row justify-around sm:justify-center w-full my-auto sm:gap-[12.8em]">
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
    <h1 className="text-lg leading-[1.048888] uppercase text-center my-auto">
      <span className="inline-block">Voice coding</span>{' '}
      <span className="inline-block">at the speed of thought</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-xs tracking-widest font-light">
      <span className="uppercase dark:opacity-50">
        This site is powered by{' '}
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
