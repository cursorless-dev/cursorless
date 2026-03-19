declare module "*.svg?react" {
  import type { JSX } from "preact";

  const component: (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element;

  export default component;
}
