import { useState } from "react";

interface Props {
  youtubeSlug: string;
}

import dynamic from "next/dynamic";
const ReactPlayer = dynamic(
  () => import("react-player/lazy").then((mod) => mod.default),
  { ssr: false },
);

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
        <ReactPlayer
          style={{ position: "absolute", top: 0, left: 0 }}
          url={`https://www.youtube-nocookie.com/watch?v=${youtubeSlug}`}
          width="100%"
          height="100%"
          controls={true}
          onError={(e) => {
            console.warn(`Error loading YouTube video: ${e}`);
            setIsError(true);
          }}
        />
      )}
    </div>
  );
}
