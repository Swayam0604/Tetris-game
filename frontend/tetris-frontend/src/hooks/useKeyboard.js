import { useEffect } from "react";
import { KEYS, GAME_STATES } from "../utils/constants";

export const useKeyboard = (gameState, gameActions) => {
  const { movePiece, rotatePieceHandler, dropPiece, hardDrop, pauseGame } =
    gameActions;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== GAME_STATES.PLAYING) {
        if (e.key === KEYS.PAUSE || e.key === KEYS.PAUSE_UPPER) {
          e.preventDefault();
          pauseGame();
        }
        return;
      }

      switch (e.key) {
        case KEYS.LEFT:
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case KEYS.RIGHT:
          e.preventDefault();
          movePiece(1, 0);
          break;
        case KEYS.DOWN:
          e.preventDefault();
          dropPiece();
          break;
        case KEYS.UP:
        case KEYS.SPACE:
          e.preventDefault();
          rotatePieceHandler();
          break;
        case KEYS.ENTER:
          e.preventDefault();
          hardDrop();
          break;
        case KEYS.PAUSE:
        case KEYS.PAUSE_UPPER:
          e.preventDefault();
          pauseGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    gameState,
    movePiece,
    rotatePieceHandler,
    dropPiece,
    hardDrop,
    pauseGame,
  ]);
};
