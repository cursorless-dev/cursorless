import React from 'react';

import { ReactComponent as Logo } from './svg/logo.svg';
import { ReactComponent as Bolt } from './svg/bolt.svg';
import { ReactComponent as Curve } from './svg/curve.svg';
import { ReactComponent as Dot } from './svg/dot.svg';
import { ReactComponent as Eye } from './svg/eye.svg';
import { ReactComponent as Fox } from './svg/fox.svg';
import { ReactComponent as Frame } from './svg/frame.svg';
import { ReactComponent as Hole } from './svg/hole.svg';
import { ReactComponent as Play } from './svg/play.svg';
import { ReactComponent as Star } from './svg/star.svg';
import { ReactComponent as Wing } from './svg/wing.svg';
import { ReactComponent as Docs } from './svg/docs.svg';
import { ReactComponent as Youtube } from './svg/youtube.svg';
import { ReactComponent as Github } from './svg/github.svg';
import { ReactComponent as Twitter } from './svg/twitter.svg';
import { ReactComponent as Sponsor } from './svg/sponsor.svg';

export default function LandingPage() {
  return (
    <main className="bg-[#f6cbbd] dark:bg-[#05020c] overflow-auto fixed top-0 bottom-0 left-0 right-0 p-8 md:p-16 text-black dark:text-[#F8C9BA] font-mono">
      <div className="h-full flex flex-col mb-8 md:mb-20">
        <header className="flex flex-row">
          <h1 className="mr-auto text-2xl md:text-5xl uppercase place-content-center font-medium tracking-[0.22em]">
            Cursorless
          </h1>
          <Logo
            title="Logo"
            className="mt-[-0.15em] md:scale-[2] md:mt-[0.5em]"
          />
        </header>
        <div className="text-xl sm:text-2xl md:text-4xl text-[#1F0202] dark:text-[#F8C9BA] my-auto grid place-content-center text-center tracking-[0.06em] md:font-semibold ">
          Structural voice coding at the speed of thought.
        </div>
        <footer className="flex flex-row justify-between md:w-[607px] md:mx-auto">
          <Dot title="Dot" className="md:scale-[1.764705]" />
          <Star title="Star" className="md:scale-[1.904761]" />
          <Wing title="Wing" className="md:scale-[2]" />
          <Play title="Play" className="md:scale-[1.845018]" />
          <Hole title="Hole" className="md:scale-[1.845018]" />
          <Eye title="Eye" className="md:scale-[1.845018]" />
          <Fox title="Fox" className="md:scale-[1.845018]" />
          <Curve title="Curve" className="md:scale-[1.845018]" />
          <Frame title="Frame" className="md:scale-[1.845018]" />
          <Bolt title="Bolt" className="md:scale-[1.845018]" />
        </footer>
      </div>
      <div className="h-full flex flex-col">
        <header className="flex flex-col items-center text-center">
          <Logo
            title="Logo"
            className="scale-[1.7] md:scale-[4] mt-10 mb-9 md:mb-20 md:mt-28"
          />
          <div className="text-[21px] sm:text-[22px] md:text-4xl md:font-semibold tracking-[0.06em]">
            Cursorless is open source.
          </div>
        </header>
        <div className="text-xl sm:text-2xl md:text-4xl text-[#1F0202] dark:text-[#F8C9BA] my-auto flex flex-row items-center justify-between md:justify-around">
          <a href="/docs" target="_blank">
            <Docs
              title="Docs"
              className="hover:text-blue-500 md:scale-[1.764705]"
            />
          </a>
          <a
            href="https://www.youtube.com/channel/UCIh61mLlS6Do3R_8KnEScIQ"
            target="_blank"
            rel="noreferrer"
          >
            <Youtube
              title="Youtube"
              className="hover:text-blue-500 md:scale-[1.904761]"
            />
          </a>
          <a
            href="https://github.com/cursorless-dev/cursorless"
            target="_blank"
            rel="noreferrer"
          >
            <Github
              title="Github"
              className="hover:text-blue-500 md:scale-[2]"
            />
          </a>
          <a
            href="https://twitter.com/GoCursorless"
            target="_blank"
            rel="noreferrer"
          >
            <Twitter
              title="Twitter"
              className="hover:text-blue-500 md:scale-[1.845018]"
            />
          </a>
          <a
            href="https://github.com/sponsors/pokey"
            target="_blank"
            rel="noreferrer"
          >
            <Sponsor
              title="Sponsor"
              className="hover:text-blue-500 md:scale-[1.845018]"
            />
          </a>
        </div>
        <footer className="text-center md:text-xl">
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
