import Hls from "hls.js";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function HlsVideoPlayer({ stream, registerVideo, checkSeek }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stream) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        maxBufferLength: 1,
        liveSyncDuration: 1,
      });
      hls.loadSource(stream.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        registerVideo && registerVideo(video);
      });

      return () => {
        hls.destroy();
      };
    }
  }, [stream, registerVideo]);

  return (
    <div className="relative w-full group">
      {loading && (
        <div className="absolute z-10 bg-slate-700 inset-0 flex flex-col gap-2 justify-center items-center text-white rounded-lg">
          <Camera className="animate-pulse" />
          <span className="text-lg animate-pulse capitalize">
            {stream?.name} — Initializing…
          </span>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        onLoadedData={() => setLoading(false)}
        onSeeking={checkSeek}
        onSeeked={() => videoRef.current.play()}
        muted
        className="w-full min-h-50 object-cover bg-black rounded-lg shadow-md"
      />
    </div>
  );
}

export default HlsVideoPlayer;
