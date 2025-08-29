// src//components/ui/UserProfile.js

import React, { useState } from "react";
import { User, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";
import { formatNumber, formatDate } from "../../utils/helpers";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      username: user.username,
      email: user.email,
    });
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: user.username,
      email: user.email,
    });
    setError("");
  };

  const handleSave = async () => {
    if (!editData.username.trim() || !editData.email.trim()) {
      setError("Username and email are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.updateProfile(editData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      // Note: In a real app, you'd update the user context here
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Score",
      value: formatNumber(user?.total_score || 0),
      color: "text-cyan-400",
    },
    {
      label: "Games Played",
      value: user?.games_played || 0,
      color: "text-green-400",
    },
    {
      label: "Highest Score",
      value: formatNumber(user?.highest_score || 0),
      color: "text-yellow-400",
    },
    {
      label: "Achivements Completed",
      value: user?.highest_level || 0,
      color: "text-purple-400",
    },
  ];

  // Player progression fields coming directly from API
  const playerLevel = user?.player_level || 1;
  const playerXp = user?.exp || 0;
  const xpNeeded = user?.exp_needed_for_next_level || 1000;
  const progressPercent = user?.progress_percent || 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.username}
              </h2>
              <p className="text-gray-400">
                Member since {formatDate(user?.created_at)}
              </p>
              {/*  Player Level Display */}
              <p className="text-pink-400 font-semibold">
                Player Level : {playerLevel}
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
                disabled={loading}
              />
            ) : (
              <div className="p-3 bg-gray-700 text-white rounded-lg">
                {user?.username}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
                disabled={loading}
              />
            ) : (
              <div className="p-3 bg-gray-700 text-white rounded-lg">
                {user?.email}
              </div>
            )}
          </div>
        </div>

        {/* Edit Buttons */}
        {isEditing && (
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}

        {/* Player Progression  */}
        <div className="mb-8">
          <h3 className="test-xl font-bold text-white mb-2">Progression</h3>
          <div className="text-gray-300 mb-2">
            XP : {playerXp} / {xpNeeded}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-pink-500 h-4 transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-lg text-center"
              >
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-red-400 mb-4">
            Danger Zone
          </h3>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
