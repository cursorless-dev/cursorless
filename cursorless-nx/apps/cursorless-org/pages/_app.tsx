import { AppProps } from 'next/app';
import './styles.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
