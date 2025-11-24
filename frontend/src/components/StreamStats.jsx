import { Card } from "./ui/card";
import { Activity, Radio, Zap } from "lucide-react";

function StreamStats({ totalStreams, activeStreams }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Radio className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Total Streams</p>
            <p className="text-2xl font-bold text-slate-100">{totalStreams}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Active</p>
            <p className="text-2xl font-bold text-slate-100">{activeStreams}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default StreamStats;
