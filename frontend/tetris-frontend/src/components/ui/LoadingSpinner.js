import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        <p className="mt-4 text-cyan-400 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
