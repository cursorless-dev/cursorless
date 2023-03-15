import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    // See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
    const pageProps = this.props?.__NEXT_DATA__?.props?.pageProps;

    return (
      <Html lang="en">
        <Head />
        <body className={pageProps.bodyClasses}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
