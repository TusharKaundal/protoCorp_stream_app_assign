import { getStreams } from "@/api/streams";
import { Monitor, RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

import HlsVideoPlayer from "./HlsVideoPlayer";
import StreamStats from "./StreamStats";
import useStreamSync from "@/hooks/useStreamSync";

const DashBoard = () => {
  const [streams, setStreams] = useState([]);
  const { loadPlayer, syncAll } = useStreamSync({
    totalStreams: streams.length,
  });

  useEffect(() => {
    async function loadStreams() {
      const data = await getStreams();
      setStreams(data);
    }
    loadStreams();
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-bl from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-slate-100">
                  HLS Stream Dashboard
                </h1>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-700 bg-transparent hover:cursor-pointer"
                onClick={syncAll}
              >
                <RotateCcw className="w-4 h-4" />
                Sync All
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StreamStats
            totalStreams={streams.length}
            activeStreams={streams.length}
          />
        </div>

        {/* Streams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream, idx) => (
            <div
              className="flex flex-col gap-2 p-4 bg-blue-900/30 rounded-lg h-fit text-white uppercase font-semibold"
              key={stream.name + "_" + idx}
            >
              <HlsVideoPlayer stream={stream} registerVideo={loadPlayer} />
              <h3 className="pl-1">cam {idx + 1}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default DashBoard;
