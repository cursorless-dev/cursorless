import styles from './embedded-video.module.css';

import { useState } from 'react';
import ReactPlayer from 'react-player/youtube';

interface Props {
  youtubeSlug: string;
}

export function EmbeddedVideo({ youtubeSlug }: Props) {
  const [isError, setIsError] = useState(false);

  return (
    <div className={styles['playerWrapper']}>
      {isError ? (
        <div
          className={`${styles['reactPlayer']} text-red-600 text-center w-full h-full flex border border-black`}
        >
          <div className="m-auto">Error loading YouTube video</div>
        </div>
      ) : (
        <ReactPlayer
          className={styles['reactPlayer']}
          url={`https://www.youtube-nocookie.com/watch?v=${youtubeSlug}`}
          width="100%"
          height="100%"
          controls={true}
          onError={(e) => {
            console.log(`Error loading YouTube video: ${e}`);
            setIsError(true);
          }}
        />
      )}
    </div>
  );
}
