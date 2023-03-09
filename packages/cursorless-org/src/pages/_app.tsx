import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
  useEffect(() => {
    document.body.className = pageProps.bodyClasses;
  });
  return <Component {...pageProps} />;
}
