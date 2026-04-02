import { lazy, Suspense } from "preact/compat";
import { useState } from "preact/hooks";

interface Props {
  youtubeSlug: string;
}

const ReactPlayer = lazy(() => import("react-player"));
const containerStyle = { paddingTop: "56.25%" };

export function EmbeddedVideo({ youtubeSlug }: Props) {
  const [isError, setIsError] = useState(false);

  return (
    <div className="position-relative" style={containerStyle}>
      {isError ? (
        <div className="d-flex h-100 w-100 border border-dark text-center text-danger position-absolute top-0 start-0">
          <div className="m-auto">Error loading YouTube video</div>
        </div>
      ) : (
        <Suspense fallback={null}>
          <ReactPlayer
            className="position-absolute top-0 start-0"
            src={`https://www.youtube-nocookie.com/watch?v=${youtubeSlug}`}
            width="100%"
            height="100%"
            controls={true}
            onError={(error) => {
              console.warn(`Error loading YouTube video: ${error}`);
              setIsError(true);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
