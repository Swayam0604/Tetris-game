import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    identifier: "", // username or email
    username: "",
    email: "",
    player_name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { login, register, user, error, setError } = useAuth();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check password match for sign-up
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // login with identifier (username or email)
        await login(formData.identifier, formData.password);
      } else {
        await register(
          formData.username,
          formData.email,
          formData.player_name,
          formData.password,
          formData.confirmPassword
        );
      }
    } catch (err) {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <input
              type="text"
              name="identifier"
              placeholder="Username or Email"
              value={formData.identifier}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
              required
              disabled={loading}
            />
          ) : (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="player_name"
                placeholder="Player Name"
                value={formData.player_name}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                required
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                required
                disabled={loading}
              />
            </>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
            required
            disabled={loading}
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
              required
              disabled={loading}
            />
          )}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded font-semibold transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 hover:text-cyan-300 ml-2 underline"
            disabled={loading}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
