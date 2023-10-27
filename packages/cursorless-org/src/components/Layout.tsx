import { MDXProvider } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types.js";
import Head from "next/head";
import BaseSocial from "./BaseSocial";
import Logo from "../pages/logo.svg";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="text-center uppercase text-[2em] leading-tight mt-6 tracking-[0.14em] font-semibold">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="uppercase text-[1.5em] my-8 font-semibold tracking-[0.08em]">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="text-[1.3em] mt-4">{children}</h3>,
  h4: ({ children }) => <h4 className="text-[1.2em] mt-4">{children}</h4>,
  hr: () => <hr className="my-8 border-teal-400" />,
  ul: ({ children }) => <ul className="list-disc ml-8">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-8">{children}</ol>,
  li: ({ children }) => <li className="my-2">{children}</li>,
  img: ({ src, alt }) => (
    // FIXME: Figure out how to use next/image with MDX
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mx-auto my-12 border-teal-400 dark:border p-6 dark:rounded-sm"
      src={src}
      alt={alt}
      style={{ maxWidth: "100%" }}
    />
  ),
  CalloutParent: ({ children }) => (
    <div className="sm:columns-2 sm:-mx-8 md:-mx-20 -mt-7 gap-7 lg:-mt-12 lg:gap-12">
      {children}
    </div>
  ),
  CalloutBox: ({ title, children }) => (
    <div className="rounded-md w-full break-inside-avoid pt-7 lg:pt-12">
      <div className="rounded-md p-2 border border-salmon-300 dark:border-salmon-700">
        <span className="font-bold">{title}</span>
        {children}
      </div>
    </div>
  ),
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
        <main className="text-salmon-900 dark:text-salmon-100 font-mono font-light p-4 sm:p-5 sm:pt-36 lg:p-10 lg:pt-12 tracking-[0.08em]">
          <div className="max-w-[70ch] mx-auto">
            <Logo
              title="Logo"
              className="mx-auto align-middle w-[30px] h-[30px] sm:w-[6.284090em] sm:h-[6.284090em]"
            />
            {children}
          </div>
          {/* TODO: Footer? */}
        </main>
      </MDXProvider>
    </>
  );
}
