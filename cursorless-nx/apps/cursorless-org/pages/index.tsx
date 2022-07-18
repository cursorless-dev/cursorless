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
    <main className="p-8 text-black dark:text-[#F8C9BA] font-mono">
      <header className="flex flex-row">
        <h1 className="mr-auto text-2xl uppercase place-content-center font-medium tracking-[0.22em]">
          Cursorless
        </h1>
        <Logo title="Logo" className="mt-[-0.15em]" />
      </header>
      <div className="text-2xl text-[#1F0202] h-[720px] grid place-content-center text-center tracking-[0.06em]">
        Structural voice coding at the speed of thought.
      </div>
      <footer className="flex flex-row justify-between">
        <Dot title="Dot" />
        <Star title="Star" />
        <Wing title="Wing" />
        <Play title="Play" />
        <Hole title="Hole" />
        <Eye title="Eye" />
        <Fox title="Fox" />
        <Curve title="Curve" />
        <Frame title="Frame" />
        <Bolt title="Bolt" />
      </footer>
    </main>
  );
}
