//  src/components/gameLogic.js

import { TETROMINOS } from "../utils/tetrominos";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../utils/constants";

// Create empty game board
export function createBoard() {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(0));
}

// Pick a random tetromino
export function getRandomTetromino() {
  const pieces = Object.keys(TETROMINOS);
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    type: randomPiece,
    shape: TETROMINOS[randomPiece].shape,
    color: TETROMINOS[randomPiece].color,
    x:
      Math.floor(BOARD_WIDTH / 2) -
      Math.floor(TETROMINOS[randomPiece].shape[0].length / 2),
    y: 0,
  };
}

// Check if piece can move to new position
export function isValidPosition(board, piece, dx = 0, dy = 0) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + dx;
        const newY = piece.y + y + dy;

        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        if (newY >= 0 && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
}

// Rotate tetromino (90° clockwise)
export function rotatePiece(piece) {
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map((row) => row[i]).reverse()
  );
  return { ...piece, shape: rotated };
}

// Place piece on the board
export function placePiece(board, piece) {
  const newBoard = board.map((row) => [...row]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        if (piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = piece.color;
        }
      }
    }
  }
  return newBoard;
}

// Clear full lines
export function clearLines(board) {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { board: newBoard, linesCleared };
}

// Ghost piece for preview
export function calculateGhostPiece(piece, board) {
  if (!piece) return null;

  let ghostY = piece.y;
  while (isValidPosition(board, { ...piece, y: ghostY + 1 })) {
    ghostY++;
  }

  return { ...piece, y: ghostY };
}

// Score calculation (lines cleared + blocks bonus)
export function calculateScore(linesCleared, blocksPlaced = 0) {
  const baseScores = {
    0: 0,
    1: 100,
    2: 300,
    3: 500,
    4: 800, // Tetris bonus
  };

  return baseScores[linesCleared] + blocksPlaced * 25;
}

const NES_DROP_TABLE = {
  0: 800,
  1: 716,
  2: 633,
  3: 550,
  4: 466,
  5: 383,
  6: 300,
  7: 216,
  8: 133,
  9: 100,
  10: 83,
  13: 50,
  16: 33,
  19: 16,
  29: 1, // killscreen
};

export function calculateDropTime(linesClearedTotal) {
  const level = Math.floor(linesClearedTotal / 10);
  // Find the closest level key in the table
  const levels = Object.keys(NES_DROP_TABLE)
    .map(Number)
    .sort((a, b) => a - b);
  let time = NES_DROP_TABLE[levels[0]];
  for (let lv of levels) {
    if (level >= lv) time = NES_DROP_TABLE[lv];
    else break;
  }
  return time;
}

