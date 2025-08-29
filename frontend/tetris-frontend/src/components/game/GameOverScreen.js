import React, { useEffect, useRef } from "react";
import { Play, Home } from "lucide-react";
import { formatTime, formatNumber } from "../../utils/helpers";
import { api } from "../../services/api";

const GameOverScreen = ({
  score,
  level,
  lines,
  gameTime,
  onRestart,
  onMainMenu,
}) => {
  // Prevent double submissions
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return; // Skip if already submitted
    submittedRef.current = true;

    const scoreData = {
      score: score,
      final_level: level, // use correct backend field names!
      lines_cleared: lines,
      duration_seconds: gameTime, // use correct backend field!
    };

    api
      .submitScore(scoreData)
      .then((response) => {
        console.log("Score submitted successfully", response);
      })
      .catch((error) => {
        console.error("Failed to submit score", error);
      });
  }, [score, level, lines, gameTime]);

  return (
    <div className="flex justify-center items-center min-h-96">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-6 text-red-400">GAME OVER</h2>

        <div className="space-y-3 mb-8">
          <div className="text-xl">
            Final Score:{" "}
            <span className="text-cyan-400 font-bold">
              {formatNumber(score)}
            </span>
          </div>
          <div className="text-lg">
            Level Reached:{" "}
            <span className="text-green-400 font-bold">{level}</span>
          </div>
          <div className="text-lg">
            Lines Cleared:{" "}
            <span className="text-yellow-400 font-bold">{lines}</span>
          </div>
          <div className="text-lg">
            Time:{" "}
            <span className="text-purple-400 font-bold">
              {formatTime(gameTime)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onMainMenu}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
