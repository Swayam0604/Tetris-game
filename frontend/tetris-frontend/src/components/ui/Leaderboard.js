import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, RefreshCcw, AlertCircle,Star } from "lucide-react";
import { api } from "../../services/api";
import { formatNumber, formatDate } from "../../utils/helpers";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [globalScores, setGlobalScores] = useState([]);
  const [personalScores, setPersonalScores] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const globalResponse = await api.getLeaderboard();
      setGlobalScores(globalResponse || []);

      const personalResponse = await api.getUserScores();
      // Ensure last 10 by created_at desc, slicing already handled by backend if applicable
      setPersonalScores(personalResponse || []);

      const achievementsResponse = await api.getAchievements();
      setAchievements(achievementsResponse || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Find highest personal score to highlight
  const highestPersonalScore =
    personalScores.length > 0
      ? Math.max(...personalScores.map((s) => s.score))
      : 0;

  // Find index of first highest personal score
  const highestIndex = personalScores.findIndex(
    (s) => s.score === highestPersonalScore
  );

  const tabs = [
    { id: "global", label: "Global Top Scores", icon: Trophy },
    { id: "personal", label: "Personal Best Scores", icon: Medal },
    { id: "achievements", label: "My Achievements", icon: Award },
  ];

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="bg-gray-800 p-6 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-cyan-400">Leaderboard</h2>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Leaderboard */}
        {activeTab === "global" && (
          <div className="space-y-3">
            {globalScores.length > 0 ? (
              globalScores.map((score, index) => {
                let borderClass = "";
                if (index === 0)
                  borderClass = "border-4 border-yellow-400"; // Gold
                else if (index === 1)
                  borderClass = "border-4 border-gray-300"; // Silver
                else if (index === 2)
                  borderClass = "border-4 border-yellow-700"; // Bronze

                return (
                  <div
                    key={score.id || index}
                    className={`flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors ${borderClass}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                            ? "bg-gray-400 text-black"
                            : index === 2
                            ? "bg-orange-500 text-black"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {score.username}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Level {score.final_level || 1} •{" "}
                          {score.created_at ? formatDate(score.created_at) : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold text-lg">
                        {formatNumber(score.score)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {score.lines_cleared || 0} lines
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400">
                No scores yet! Be the first to set a high score!
              </div>
            )}
          </div>
        )}

        {/* Personal Best Scores */}
        {activeTab === "personal" && (
          <div className="space-y-3">
            {personalScores.length > 0 ? (
              personalScores.map((score, index) => {
                const isHighest = index === highestIndex;
                return (
                  <div
                    key={score.id || index}
                    className={`flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors ${
                      isHighest ? "border-4 border-yellow-400" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white">
                        {isHighest ? (
                          <Star className="text-yellow-400 w-6 h-6" />
                        ) : (
                          index
                        )}
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">
                          Game #{personalScores.length - index}
                        </div>
                        <div className="text-white">
                          Level {score.final_level || 1} •{" "}
                          {score.created_at ? formatDate(score.created_at) : ""}
                        </div>
                      </div>
                      {/* New: 'Highest' highlight badge, right-aligned */}
                      {isHighest && (
                        <span className="ml-4 bg-yellow-400 px-3 py-1 rounded-full text-gray-900 text-xs font-semibold">
                          Highest
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">
                        {formatNumber(score.score)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {score.lines_cleared || 0} lines •{" "}
                        {score.duration_seconds || "N/A"}s
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400">
                No games played! Play to see scores here.
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center space-x-4 bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div>
                    <div className="text-white font-semibold">
                      {ach.achievement_name || "Achievement"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Earned {ach.earned_at ? formatDate(ach.earned_at) : ""}
                    </div>
                  </div>
                  {ach.score && (
                    <div className="text-yellow-400 text-sm">
                      Score: {formatNumber(ach.score)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">
                No achievements yet! Keep playing.
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full border-b-2 border-cyan-400 w-12 h-12 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
