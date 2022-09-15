import { AppProps } from 'next/app';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <main className="app">
      <Component {...pageProps} />
    </main>
  );
}

export default CustomApp;
