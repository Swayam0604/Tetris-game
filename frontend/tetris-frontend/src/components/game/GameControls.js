import React from "react";
import {
  Play,
  Pause,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { GAME_STATES } from "../../utils/constants";

const GameControls = ({
  gameState,
  onPause,
  onMove,
  onRotate,
  onDrop,
  onHardDrop,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <h3 className="text-cyan-400 font-semibold">Controls</h3>

      {/* Desktop Controls Info */}
      <div className="hidden lg:block text-sm space-y-2 text-gray-300">
        <div className="flex justify-between">
          <span>Move:</span>
          <span>← →</span>
        </div>
        <div className="flex justify-between">
          <span>Rotate:</span>
          <span>↑ / Space</span>
        </div>
        <div className="flex justify-between">
          <span>Soft Drop:</span>
          <span>↓</span>
        </div>
        <div className="flex justify-between">
          <span>Hard Drop:</span>
          <span>Enter</span>
        </div>
        <div className="flex justify-between">
          <span>Pause:</span>
          <span>P</span>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="lg:hidden space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={onRotate}
            disabled={gameState !== GAME_STATES.PLAYING}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <div></div>

          <button
            onClick={() => onMove(-1, 0)}
            disabled={gameState !== GAME_STATES.PLAYING}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onDrop}
            disabled={gameState !== GAME_STATES.PLAYING}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => onMove(1, 0)}
            disabled={gameState !== GAME_STATES.PLAYING}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {gameState === GAME_STATES.PLAYING ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            )}
          </button>
          <button
            onClick={onHardDrop}
            disabled={gameState !== GAME_STATES.PLAYING}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-2 rounded-lg font-semibold transition-colors"
          >
            DROP
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
