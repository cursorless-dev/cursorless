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

export function Hats() {
  return (
    <div className="flex flex-row items-center justify-between md:w-[607px] md:mx-auto">
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
    </div>
  );
}
