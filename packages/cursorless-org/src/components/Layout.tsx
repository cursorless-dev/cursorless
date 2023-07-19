import Head from "next/head";
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react";
import BaseSocial from "./BaseSocial";

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

export const bodyClasses = "bg-salmon-100 dark:bg-salmon-900";

export interface Props extends React.PropsWithChildren {
  title: string;
  description: string;
  relativeUrl: string;
}

export function Layout({ title, description, relativeUrl, children }: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <BaseSocial
          title={title}
          description={description}
          relativeUrl={relativeUrl}
        />
      </Head>
      <MDXProvider components={components}>
        <main className="text-salmon-900 dark:text-salmon-100 font-mono p-4 sm:p-5 lg:p-8">
          <div className="max-w-prose mx-auto">{children}</div>
        </main>
      </MDXProvider>
    </>
  );
}
