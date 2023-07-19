import EnablementGroup from "../content/enablement-group.mdx";
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react";

const components: MDXProviderComponentsProp = {
  h1: ({ children }) => (
    <h1 className="text-center text-[2.5em] leading-tight mb-3">{children}</h1>
  ),
  h2: ({ children }) => <h2 className="text-[1.5em] mb-5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[1.3em] mt-4">{children}</h3>,
  hr: () => <hr className="my-5 border-salmon-900 dark:border-salmon-100" />,
  ul: ({ children }) => <ul className="list-disc ml-8">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-8">{children}</ol>,
  li: ({ children }) => <li className="my-2">{children}</li>,
};

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return { props: { bodyClasses: "bg-salmon-100 dark:bg-salmon-900" } };
}

export default function Page() {
  return (
    <MDXProvider components={components}>
      <main className="text-salmon-900 dark:text-salmon-100 font-mono p-4 sm:p-5 lg:p-8">
        <div className="max-w-prose mx-auto">
          <EnablementGroup />
        </div>
      </main>
    </MDXProvider>
  );
}
