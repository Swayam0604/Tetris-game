// api.js
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

class TetrisAPI {
  // No need to store token as instance variable since we get it fresh each request

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    // Always get token fresh from localStorage here
    const token = localStorage.getItem("tetris_token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.message ||
            `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async register(username, email, password, player_name, password_confirm) {
    const data = await this.request("/auth/register/", {
      method: "POST",
      body: {
        username,
        email,
        player_name,
        password,
        password_confirm, // send this to backend
      },
    });
    localStorage.setItem("tetris_token", data.access);
    return data;
  }

  async login(identifier, password) {
    const data = await this.request("/auth/login/", {
      method: "POST",
      body: { identifier, password },
    });
    console.log("Login response data:", data); // <--- add this temporarily
    localStorage.setItem("tetris_token", data.access);
    return data;
  }

  logout() {
    localStorage.removeItem("tetris_token");
  }

  async getProfile() {
    return this.request("/auth/profile/");
  }

  async updateProfile(data) {
    return this.request("/auth/profile/update/", {
      method: "PUT",
      body: data,
    });
  }

  async submitScore(data) {
    return this.request("/game/submit-score/", {
      method: "POST",
      body: data,
    });
  }

  async getLeaderboard() {
    return this.request("/game/leaderboard/");
  }

  async getUserScores() {
    return this.request("/game/scores/user/");
  }

  async getAchievements() {
    return this.request("/game/achievements/");
  }

  async createGameSession(gameData) {
    return this.request("/game/game-sessions/", {
      method: "POST",
      body: gameData,
    });
  }

  async updateGameSession(sessionId, gameData) {
    return this.request(`/game/game-sessions/${sessionId}/`, {
      method: "PUT",
      body: gameData,
    });
  }

  async deleteGameSession(sessionId) {
    return this.request(`/game/game-sessions/${sessionId}/`, {
      method: "DELETE",
    });
  }
}

  

export const api = new TetrisAPI();
