import type {
  LoadContext,
  PluginOptions,
  PostCssOptions,
} from "@docusaurus/types";
import tailwindcss from "@tailwindcss/postcss";

export default function tailwindPlugin(
  _context: LoadContext,
  _options: PluginOptions,
) {
  return {
    name: "tailwind-plugin",

    configurePostCss(postcssOptions: PostCssOptions): PostCssOptions {
      postcssOptions.plugins.push(tailwindcss);
      return postcssOptions;
    },
  };
}
