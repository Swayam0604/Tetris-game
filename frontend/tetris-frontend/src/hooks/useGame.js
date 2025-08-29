import { useState, useRef, useCallback, useEffect } from "react";
import {
  createBoard,
  getRandomTetromino,
  isValidPosition,
  rotatePiece,
  placePiece,
  clearLines,
  calculateGhostPiece,
  calculateScore,
  calculateDropTime,
} from "../services/gameLogic";
import { GAME_STATES } from "../utils/constants";
import { api } from "../services/api";

export const useGame = () => {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [board, setBoard] = useState(createBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [ghostPiece, setGhostPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [dropTime, setDropTime] = useState(1000);

  const gameLoopRef = useRef();
  const gameStartTime = useRef();

  const startGame = useCallback(() => {
    const newBoard = createBoard();
    const firstPiece = getRandomTetromino();
    const secondPiece = getRandomTetromino();

    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setGhostPiece(calculateGhostPiece(firstPiece, newBoard));
    setScore(0);
    setLines(0);
    setGameTime(0);
    setDropTime(1000);
    setGameState(GAME_STATES.PLAYING);
    gameStartTime.current = Date.now();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(
      gameState === GAME_STATES.PLAYING
        ? GAME_STATES.PAUSED
        : GAME_STATES.PLAYING
    );
  }, [gameState]);

  const endGame = useCallback(async () => {
    setGameState(GAME_STATES.GAME_OVER);

    try {
      const finalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);
      await api.submitScore(score, lines, finalTime);
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  }, [score, lines]);

  const movePiece = useCallback(
    (dx, dy) => {
      if (gameState !== GAME_STATES.PLAYING || !currentPiece) return false;

      if (isValidPosition(board, currentPiece, dx, dy)) {
        const newPiece = {
          ...currentPiece,
          x: currentPiece.x + dx,
          y: currentPiece.y + dy,
        };
        setCurrentPiece(newPiece);
        setGhostPiece(calculateGhostPiece(newPiece, board));
        return true;
      }
      return false;
    },
    [gameState, currentPiece, board]
  );

  const rotatePieceHandler = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING || !currentPiece) return;

    const rotated = rotatePiece(currentPiece);
    if (isValidPosition(board, rotated)) {
      setCurrentPiece(rotated);
      setGhostPiece(calculateGhostPiece(rotated, board));
    }
  }, [gameState, currentPiece, board]);

  const dropPiece = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING || !currentPiece) return;

    if (!movePiece(0, 1)) {
      // Piece can't move down, place it
      if (currentPiece.y <= 0) {
        endGame();
        return;
      }

      const newBoard = placePiece(board, currentPiece);
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);

      // count blocks placed
      const blocksPlaced = currentPiece.shape.flat().filter(Boolean).length;

      // new stats
      const newLines = lines + linesCleared;
      const gainedScore = calculateScore(linesCleared, blocksPlaced);
      const newScore = score + gainedScore;

      setBoard(clearedBoard);
      setCurrentPiece(nextPiece);
      setNextPiece(getRandomTetromino());
      setLines(newLines);
      setScore(newScore);
      setDropTime(calculateDropTime(newLines));

      if (nextPiece) {
        setGhostPiece(calculateGhostPiece(nextPiece, clearedBoard));
      }
    }
  }, [
    gameState,
    currentPiece,
    board,
    nextPiece,
    lines,
    score,
    movePiece,
    endGame,
  ]);

  const hardDrop = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING || !currentPiece) return;

    let newY = currentPiece.y;
    while (isValidPosition(board, currentPiece, 0, newY - currentPiece.y + 1)) {
      newY++;
    }

    const droppedPiece = { ...currentPiece, y: newY };
    setCurrentPiece(droppedPiece);

    setTimeout(dropPiece, 0);
  }, [gameState, currentPiece, board, dropPiece]);

  // Game loop
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      gameLoopRef.current = setInterval(() => {
        setGameTime(Math.floor((Date.now() - gameStartTime.current) / 1000));
        dropPiece();
      }, dropTime);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, dropTime, dropPiece]);

  return {
    gameState,
    board,
    currentPiece,
    nextPiece,
    ghostPiece,
    score,
    lines,
    gameTime,
    startGame,
    pauseGame,
    endGame,
    movePiece,
    rotatePieceHandler,
    dropPiece,
    hardDrop,
    setGameState,
  };
};
