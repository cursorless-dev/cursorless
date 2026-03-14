import { lazy, Suspense } from "preact/compat";
import { useState } from "preact/hooks";

interface Props {
  youtubeSlug: string;
}

const ReactPlayer = lazy(async () => import("react-player"));

export function EmbeddedVideo({ youtubeSlug }: Props) {
  const [isError, setIsError] = useState(false);

  return (
    <div style={{ position: "relative", paddingTop: "56.25%" }}>
      {isError ? (
        <div
          className={`flex h-full w-full border border-black text-center text-red-600`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <div className="m-auto">Error loading YouTube video</div>
        </div>
      ) : (
        <Suspense fallback={null}>
          <ReactPlayer
            style={{ position: "absolute", top: 0, left: 0 }}
            src={`https://www.youtube-nocookie.com/watch?v=${youtubeSlug}`}
            width="100%"
            height="100%"
            controls={true}
            onError={(error) => {
              console.log(`Error loading YouTube video: ${error}`);
              setIsError(true);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
