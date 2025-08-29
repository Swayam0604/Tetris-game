import React from "react";
import { formatTime, formatNumber } from "../../utils/helpers";

const GameStats = ({ score, lines, time }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <h3 className="text-cyan-400 font-semibold text-lg">Game Stats</h3>

      <div className="space-y-3">
        <div className="text-cyan-400">
          <div className="text-sm opacity-80">Score</div>
          <div className="text-2xl font-bold">{formatNumber(score)}</div>
        </div>

        <div className="text-yellow-400">
          <div className="text-sm opacity-80">Lines</div>
          <div className="text-xl font-bold">{lines}</div>
        </div>

        <div className="text-purple-400">
          <div className="text-sm opacity-80">Time</div>
          <div className="text-lg font-bold">{formatTime(time)}</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
