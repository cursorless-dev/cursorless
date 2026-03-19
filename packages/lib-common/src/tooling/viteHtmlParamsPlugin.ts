export function viteHtmlParams(params: Record<string, string>) {
  return {
    name: "vite-html-params",
    enforce: "post",

    transformIndexHtml(html: string): string {
      for (const [key, value] of Object.entries(params)) {
        const pattern = `__${key}__`;
        if (!html.includes(pattern)) {
          throw new Error(`Expected index.html to contain pattern ${pattern}`);
        }
        html = html.replaceAll(pattern, value);
      }
      return html;
    },
  };
}
