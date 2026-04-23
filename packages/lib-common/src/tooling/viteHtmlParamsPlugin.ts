export function viteHtmlParams(params: Record<string, string>) {
  return {
    name: "vite-html-params",
    enforce: "post",

    transformIndexHtml(html: string): string {
      let output = html;

      for (const [key, value] of Object.entries(params)) {
        const pattern = `__${key}__`;
        if (!output.includes(pattern)) {
          throw new Error(`Expected index.html to contain pattern ${pattern}`);
        }
        output = output.replaceAll(pattern, value);
      }

      return output;
    },
  };
}
