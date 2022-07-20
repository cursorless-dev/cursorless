import { useCallback, useState } from 'react';
import { useKey } from 'react-use';
import YouTube, { YouTubeEvent } from 'react-youtube';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { YouTubePlayer } from 'youtube-player/dist/types';
import styles from './embedded-video.module.css';
import useInterval from './hooks/useInterval';

interface Props {
  youtubeSlug: string;
  controller?: Controller;
}

interface Controller {
  onReady(event: YouTubeEvent): void;
}

export function EmbeddedVideo({ youtubeSlug, controller }: Props) {
  return (
    <YouTube
      className={styles['embedContainer']}
      videoId={youtubeSlug}
      onReady={controller?.onReady}
    />
  );
}

/**
 * Keys that can be used to toggle playback
 */
const TOGGLE_KEYS = [' ', 'k'];

export function useEmbeddedVideoController(playbackUpdateIntervalMs = 500) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [playbackTime, setPlaybackTime] = useState<number | null>(null);

  const onReady = useCallback((event: YouTubeEvent) => {
    setPlayer(event.target);
  }, []);

  const updatePlaybackTime = useCallback(async () => {
    if (player != null) {
      setPlaybackTime(await player.getCurrentTime());
    }
  }, [player]);

  const togglePlayback = async () => {
    if (player == null) {
      return;
    }

    if ((await player.getPlayerState()) === PlayerStates.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  useKey(
    (event) => TOGGLE_KEYS.includes(event.key),
    async (event) => {
      await togglePlayback();
      event.preventDefault();
    },
    {},
    [player]
  );

  const seekTo = useCallback(
    (seconds: number, allowSeekAhead: boolean) => {
      if (player != null) {
        player.seekTo(seconds, allowSeekAhead);
      }
    },
    [player]
  );

  useInterval(
    updatePlaybackTime,
    player == null ? null : playbackUpdateIntervalMs
  );

  return {
    playbackTime,
    setPlaybackTime: seekTo,
    controller: {
      onReady,
    } as Controller,
  };
}
