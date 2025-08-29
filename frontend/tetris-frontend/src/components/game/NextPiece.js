import React from "react";

const NextPiece = ({ piece }) => {
  if (!piece) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-cyan-400 font-semibold mb-2">Next</h3>
      <div className="flex justify-center">
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
          }}
        >
          {piece.shape.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-4 h-4 border border-gray-700 ${
                  cell ? "bg-current" : "bg-gray-900"
                }`}
                style={{ color: cell ? piece.color : undefined }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NextPiece;
