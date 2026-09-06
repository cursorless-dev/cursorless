import { Button } from "./Button";
import { DESCRIPTION, NAME, TITLE, YOUTUBE_SLUG } from "./constants";
import { EmbeddedVideo } from "./EmbeddedVideo";
import Logo from "./logo.svg?react";
import { Title } from "./Title";

export function LandingPage() {
  return (
    <>
      <Title>{TITLE}</Title>

      <main className="landing-page">
        <div className="container">
          <div className="row min-vh-100 align-items-center">
            <div className="col-12">
              <div className="row ">
                <div className="col-12">
                  <Header />
                </div>

                <div className="col-12">
                  <Slogan />
                </div>

                <div className="col-12">
                  <div className="landing-page-video-frame">
                    <EmbeddedVideo youtubeSlug={YOUTUBE_SLUG} />
                  </div>
                </div>

                <div className="col-12 ">
                  <Buttons />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Header() {
  return (
    <header className="row align-items-center mb-4">
      <div className="col text-uppercase">{NAME}</div>
      <div className="col-auto">
        <Logo title={`${NAME} logo`} className="landing-page-logo" />
      </div>
    </header>
  );
}

function Slogan() {
  return <h1 className="text-center text-uppercase mb-4">{DESCRIPTION}</h1>;
}

function Buttons() {
  return (
    <div className="row justify-content-center mt-5">
      <div className="col-3 text-center">
        <Button text="Docs" href="/docs" isExternal={false} />
      </div>
      <div className="col-3 text-center">
        <Button
          text="Donate"
          href="https://github.com/sponsors/cursorless-dev"
          isExternal
        />
      </div>
    </div>
  );
}
