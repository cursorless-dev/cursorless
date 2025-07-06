import type {
  LoadContext,
  PluginOptions,
  PostCssOptions,
} from "@docusaurus/types";
import tailwindcss from "tailwindcss";

export default function tailwindPlugin(
  _context: LoadContext,
  _options: PluginOptions,
) {
  return {
    name: "tailwind-plugin",

    configurePos1tCss(postcssOptions: PostCssOptions): PostCssOptions {
      postcssOptions.plugins.push(tailwindcss);
      return postcssOptions;
    },
  };
}
