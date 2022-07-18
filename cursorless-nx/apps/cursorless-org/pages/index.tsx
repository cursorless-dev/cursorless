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

export default function LandingPage() {
  return (
    <main className="p-8 md:p-16 text-black dark:text-[#F8C9BA] font-mono h-screen flex flex-col">
      <header className="flex flex-row">
        <h1 className="mr-auto text-2xl md:text-5xl uppercase place-content-center font-medium tracking-[0.22em]">
          Cursorless
        </h1>
        <Logo
          title="Logo"
          className="mt-[-0.15em] md:scale-[2] md:mt-[0.5em]"
        />
      </header>
      <div className="text-2xl md:text-4xl text-[#1F0202] dark:text-[#F8C9BA] my-auto grid place-content-center text-center tracking-[0.06em] md:font-semibold ">
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
    </main>
  );
}
