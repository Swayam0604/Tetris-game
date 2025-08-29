import React, { useEffect } from "react";
import { useGame } from "../../hooks/useGame";
import { useKeyboard } from "../../hooks/useKeyboard";
import { GAME_STATES } from "../../utils/constants";
import GameStats from "./GameStats";
import NextPiece from "./NextPiece";
import GameControls from "./GameControls";
import GameOverScreen from "./GameOverScreen";
import { placePiece, calculateDropTime } from "../../services/gameLogic";
import { Play, Pause } from "lucide-react";

const GameBoard = () => {
  const gameData = useGame();
  const {
    gameState,
    board,
    currentPiece,
    nextPiece,
    ghostPiece,
    score,
    level,
    lines,
    gameTime,
    startGame,
    pauseGame,
    movePiece,
    rotatePieceHandler,
    dropPiece,
    hardDrop,
    setGameState,
  } = gameData;

  useKeyboard(gameState, {
    movePiece,
    rotatePieceHandler,
    dropPiece,
    hardDrop,
    pauseGame,
  });

  // Dynamic drop timer effect
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const dropInterval = calculateDropTime(level, score);
    const timer = setInterval(() => {
      dropPiece();
    }, dropInterval);

    return () => clearInterval(timer);
  }, [level, score, gameState, dropPiece]);

  const renderBoard = () => {
    let displayBoard = [...board.map((row) => [...row])];

    if (currentPiece) {
      displayBoard = placePiece(displayBoard, currentPiece);
    }

    if (ghostPiece && currentPiece) {
      for (let y = 0; y < ghostPiece.shape.length; y++) {
        for (let x = 0; x < ghostPiece.shape[y].length; x++) {
          if (ghostPiece.shape[y][x] && ghostPiece.y + y >= 0) {
            if (!displayBoard[ghostPiece.y + y][ghostPiece.x + x]) {
              displayBoard[ghostPiece.y + y][ghostPiece.x + x] = "ghost";
            }
          }
        }
      }
    }

    return (
      <div className="game-board grid grid-cols-10 gap-0.5 bg-gray-900 p-2 rounded-lg">
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-6 h-6 border border-gray-700 ${
                cell === 0
                  ? "bg-gray-800"
                  : cell === "ghost"
                  ? "bg-gray-600 opacity-50"
                  : "bg-current"
              }`}
              style={{
                color:
                  typeof cell === "string" && cell !== "ghost"
                    ? cell
                    : undefined,
              }}
            />
          ))
        )}
      </div>
    );
  };

  if (gameState === GAME_STATES.MENU) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center bg-gray-800 p-8 rounded-lg max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">
            Ready to Play?
          </h2>
          <button
            onClick={startGame}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors flex items-center space-x-2 mx-auto"
          >
            <Play className="w-6 h-6" />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === GAME_STATES.GAME_OVER) {
    return (
      <GameOverScreen
        score={score}
        level={level}
        lines={lines}
        gameTime={gameTime}
        onRestart={startGame}
        onMainMenu={() => setGameState(GAME_STATES.MENU)}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
      {/* Left Panel - Stats */}
      <div className="flex flex-col gap-4 lg:w-48">
        <GameStats score={score} level={level} lines={lines} time={gameTime} />
        <NextPiece piece={nextPiece} />
      </div>

      {/* Main Game Board */}
      <div className="relative">
        {renderBoard()}

        {gameState === GAME_STATES.PAUSED && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Pause className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">PAUSED</h2>
              <button
                onClick={pauseGame}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Controls */}
      <div className="lg:w-48">
        <GameControls
          gameState={gameState}
          onPause={pauseGame}
          onMove={movePiece}
          onRotate={rotatePieceHandler}
          onDrop={dropPiece}
          onHardDrop={hardDrop}
        />
      </div>
    </div>
  );
};

export default GameBoard;
