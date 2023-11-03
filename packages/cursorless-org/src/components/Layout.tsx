import { MDXProvider } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types.js";
import Head from "next/head";
import Logo from "../pages/logo.svg";
import BaseSocial from "./BaseSocial";
import { SpamProofEmailLink } from "./SpamProofEmailLink";
import Link from "next/link";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="text-center uppercase text-[1.88em] leading-tight mt-7 tracking-[0.14em] font-semibold">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="uppercase text-[1.5em] mt-8 mb-4 sm:mb-8 leading-[1.2] font-semibold tracking-[0.08em]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="uppercase text-[1.25rem] mt-6 mb-3 sm:mb-6 leading-tight font-medium tracking-[0.08em]">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="uppercase text-[1.125rem] mt-11 mb-3 sm:mb-6 font-medium tracking-[0.08em]">
      {children}
    </h4>
  ),
  hr: () => <hr className="my-8 border-black dark:border-white" />,
  ul: ({ children }) => <ul className="list-disc ml-8">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-8">{children}</ol>,
  li: ({ children }) => <li className="my-2">{children}</li>,
  img: ({ src, alt }) => (
    // FIXME: Figure out how to use next/image with MDX
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mx-auto my-12 rounded-[4px] border-teal-400 border-[1.5px]"
      src={src}
      alt={alt}
      style={{ maxWidth: "100%" }}
    />
  ),
  CursorlessScreenshot: ({ src, alt }) => (
    // FIXME: Figure out how to use next/image with MDX
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mx-auto my-12 border-teal-400 border p-3 sm:p-6 rounded-sm"
      src={src}
      alt={alt}
      style={{ maxWidth: "100%" }}
    />
  ),
  CalloutBox: ({ children }) => (
    <div className="border-teal-400 border rounded-sm px-7 my-12 pb-6">
      {children}
    </div>
  ),
  Testimonials: ({ children }) => (
    <div className="flex flex-col gap-5 mt-8">{children}</div>
  ),
  Testimonial: ({ children, src, name, title, company }) => (
    <div className="flex flex-col items-center bg-teal-100 dark:bg-teal-900 border border-teal-400 text-teal-700 dark:text-teal-300 p-3 sm:p-6 rounded-sm">
      <blockquote className="mb-5 sm:mb-6 flex flex-col gap-4">
        {children}
      </blockquote>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="rounded-full w-[4.5em] h-[4.5em] border-teal-400 border dark:border-[0.5px]"
          src={src}
          alt={name}
        />
        <div className="flex flex-col gap-[0.375rem]">
          <div className="text-teal-800 dark:text-teal-200 font-semibold text-[1.2em] leading-none">
            {name}
          </div>
          <div className="text-[0.9em] leading-none">{title}</div>
          <div className="text-[0.9em] leading-none">{company}</div>
        </div>
      </div>
    </div>
  ),
  Tiers: ({ children }) => (
    <div className="my-8 font-medium tracking-[0.1em] text-[1.2em]">
      {children}
    </div>
  ),
  Tier: ({ emoji, type, price, address, subject, body }) => (
    <div className="grid grid-cols-2 gap-2 leading-8">
      <span className="uppercase">
        {emoji} {type}
      </span>
      <SpamProofEmailLink address={address} subject={subject} body={body}>
        <span className="text-[24px]">{price}</span>
      </SpamProofEmailLink>
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
        <main className="text-salmon-900 dark:text-salmon-100 font-mono font-normal sm:dark:font-light px-4 pt-8 sm:pt-16 lg:pt-20 pb-8 tracking-[0.08em] leading-6">
          <div className="max-w-prose mx-auto">
            <Link href="/">
              <Logo
                title="Logo"
                className="mx-auto align-middle w-[6.284em] h-[6.284em]"
              />
            </Link>
            {children}
          </div>
        </main>
      </MDXProvider>
    </>
  );
}
