import { useRef } from "react";

export default function useStreamSync({ totalStreams = 6 }) {
  const playersRef = useRef([]);

  const loadPlayer = (video) => {
    if (!video) return;

    // push player
    playersRef.current.push(video);
    if (playersRef.current.length === totalStreams) {
      syncAll();
    }
  };

  const syncAll = async () => {
    const players = playersRef.current;
    if (!players.length) return;

    // choose master
    const master = getMaster();
    const targetTime = master.currentTime || 0;

    // pause all to avoid playing while seeking
    players.forEach((video) => {
      video.pause();
    });

    // set currentTime for each
    players.forEach((video) => {
      const dt = Math.abs((video.currentTime || 0) - targetTime);
      if (dt > 0.1) {
        video.currentTime = targetTime;
      }
    });

    // slight delay to ensure seeks applied
    await new Promise((r) => setTimeout(r, 200));

    // start playing all together
    players.map((video) => {
      video.play();
    });
  };

  const getMaster = () => {
    if (playersRef.current.length === 0) return null;

    let candidate = null;
    let bestLiveEdgeDistance = Infinity;

    playersRef.current.forEach((video) => {
      if (!video || video.readyState < 2) return;

      // get buffered end (live edge for LL-HLS)
      const bufferedEnd =
        video.buffered.length > 0
          ? video.buffered.end(video.buffered.length - 1)
          : 0;

      const currentTime = video.currentTime;
      const distanceFromEdge = Math.abs(bufferedEnd - currentTime);

      if (distanceFromEdge < bestLiveEdgeDistance) {
        bestLiveEdgeDistance = distanceFromEdge;
        candidate = video;
      }
    });

    return candidate || playersRef.current[0]; // fallback
  };

  return {
    loadPlayer,
    syncAll,
  };
}
