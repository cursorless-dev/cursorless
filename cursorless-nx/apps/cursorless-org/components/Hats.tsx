import { ReactComponent as Bolt } from '../pages/svg/bolt.svg';
import { ReactComponent as Curve } from '../pages/svg/curve.svg';
import { ReactComponent as Dot } from '../pages/svg/dot.svg';
import { ReactComponent as Eye } from '../pages/svg/eye.svg';
import { ReactComponent as Fox } from '../pages/svg/fox.svg';
import { ReactComponent as Frame } from '../pages/svg/frame.svg';
import { ReactComponent as Hole } from '../pages/svg/hole.svg';
import { ReactComponent as Play } from '../pages/svg/play.svg';
import { ReactComponent as Star } from '../pages/svg/star.svg';
import { ReactComponent as Wing } from '../pages/svg/wing.svg';

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
