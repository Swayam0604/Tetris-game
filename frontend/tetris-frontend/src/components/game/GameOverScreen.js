//   src/components/game/GameOverScreen.js

import React, { useEffect, useRef ,useState} from "react";
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

  // Local stated for EXP and player Level 
  const [expGained, setExpGained] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);


  useEffect(() => {
    if (submittedRef.current) return; // Skip if already submitted
    submittedRef.current = true;

    // Example EXP Calculation: 1 exp for every 50 score 
    const exp = Math.floor(score / 50);
    setExpGained(exp);

    //  Example leveling system : every 1000 EXP  = +1 player level 
    //  (you.d normally fetch current EXP/ level from backend and update there)
    const newLevel = 1 + Math.floor(score / 1000);
    setPlayerLevel(newLevel);

    const scoreData = {
      score: score,
      final_level: level, // use correct backend field names!
      lines_cleared: lines,
      duration_seconds: gameTime, // use correct backend field!
      exp_gained: exp,
      player_level: newLevel, //
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

          {/* NEW EXP & PLAYER LEVEL  */}
          <div className="text-lg">
            Exp Gained: {" "}
            <span className="text-blue-400 font-bold">{expGained}</span>
          </div>
          <div className="text-lg">
            Player Level: {" "}
            <span className="text-pink-400 font-bold">{playerLevel}</span>
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
