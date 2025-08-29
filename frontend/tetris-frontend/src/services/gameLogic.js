import { TETROMINOS } from "../utils/tetrominos";
import{ BOARD_WIDTH, BOARD_HEIGHT} from "../utils/constants"
export function createBoard() {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(0));
}

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

export function rotatePiece(piece) {
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map((row) => row[i]).reverse()
  );
  return { ...piece, shape: rotated };
}

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

export function clearLines(board) {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { board: newBoard, linesCleared };
}

export function calculateGhostPiece(piece, board) {
  if (!piece) return null;

  let ghostY = piece.y;
  while (isValidPosition(board, { ...piece, y: ghostY + 1 })) {
    ghostY++;
  }

  return { ...piece, y: ghostY };
}

export function calculateScore(linesCleared, level) {
  const baseScores = {
    0: 0,
    1: 100,
    2: 300,
    3: 500,
    4: 800, // Tetris bonus
  };

  return baseScores[linesCleared] * level;
}

export function calculateLevel(totalLines) {
  return Math.floor(totalLines / 10) + 1;
}

export function calculateDropTime(level, totalScore) {
  const baseTime = 1000; // base ms drop interval
  const minTime = 50; // minimum interval clamp

  // Speed up based on level
  let dropTime = baseTime - (level - 1) * 50;

  // Add extra speed-up for every 1000 points (including at 1000)
  if (totalScore >= 1000) {
    // For 1000 → 1 step, 2000 → 2 steps, etc.
    const extraSpeedIncrements = Math.floor(totalScore / 1000);
    const extraReductionPerIncrement = 1000;

    dropTime -= extraSpeedIncrements * extraReductionPerIncrement;
  }

  // Clamp to minimum
  return Math.max(minTime, dropTime);
}
