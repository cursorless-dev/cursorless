import { MDXProvider } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types.js";
import Head from "next/head";
import Logo from "../pages/logo.svg";
import BaseSocial from "./BaseSocial";
import { SpamProofEmailLink } from "./SpamProofEmailLink";
import Link from "next/link";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mt-7 text-center text-[1.88em] font-semibold uppercase leading-tight tracking-[0.14em]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-8 text-[1.5em] font-semibold uppercase leading-[1.2] tracking-[0.08em] sm:mb-8">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-6 text-[1.25rem] font-medium uppercase leading-tight tracking-[0.08em] sm:mb-6">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-3 mt-11 text-[1.125rem] font-medium uppercase tracking-[0.08em] sm:mb-6">
      {children}
    </h4>
  ),
  hr: () => <hr className="my-8 border-black dark:border-white" />,
  ul: ({ children }) => <ul className="ml-8 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="ml-8 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="my-2">{children}</li>,
  img: ({ src, alt }) => (
    // FIXME: Figure out how to use next/image with MDX
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mx-auto my-12 rounded-[4px] border-[1.5px] border-teal-400"
      src={src}
      alt={alt}
      style={{ maxWidth: "100%" }}
    />
  ),
  CursorlessScreenshot: ({ src, alt }) => (
    // FIXME: Figure out how to use next/image with MDX
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mx-auto my-12 rounded-sm border border-teal-400 p-3 sm:p-6"
      src={src}
      alt={alt}
      style={{ maxWidth: "100%" }}
    />
  ),
  CalloutBox: ({ children }) => (
    <div className="my-12 rounded-sm border border-teal-400 px-7 pb-6">
      {children}
    </div>
  ),
  Testimonials: ({ children }) => (
    <div className="mt-8 flex flex-col gap-5">{children}</div>
  ),
  Testimonial: ({ children, src, name, title, company }) => (
    <div className="flex flex-col items-center rounded-sm border border-teal-400 bg-teal-100 p-3 text-teal-700 dark:bg-teal-900 dark:text-teal-300 sm:p-6">
      <blockquote className="mb-5 flex flex-col gap-4 sm:mb-6">
        {children}
      </blockquote>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="h-[4.5em] w-[4.5em] rounded-full border border-teal-400 dark:border-[0.5px]"
          src={src}
          alt={name}
        />
        <div className="flex flex-col gap-[0.375rem]">
          <div className="text-[1.2em] font-semibold leading-none text-teal-800 dark:text-teal-200">
            {name}
          </div>
          <div className="text-[0.9em] leading-none">{title}</div>
          <div className="text-[0.9em] leading-none">{company}</div>
        </div>
      </div>
    </div>
  ),
  Tiers: ({ children }) => (
    <div className="my-8 text-[1.2em] font-medium tracking-[0.1em]">
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
        <main className="text-salmon-900 dark:text-salmon-100 px-4 pb-8 pt-8 font-mono font-normal leading-6 tracking-[0.08em] sm:pt-16 sm:dark:font-light lg:pt-20">
          <div className="mx-auto max-w-prose">
            <Link href="/">
              <Logo
                title="Logo"
                className="mx-auto h-[6.284em] w-[6.284em] align-middle"
              />
            </Link>
            {children}
          </div>
        </main>
      </MDXProvider>
    </>
  );
}
