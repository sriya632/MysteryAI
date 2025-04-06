import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/gameStart');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      // Login logic
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/gameStart');
      } else {
        setError('Invalid username or password');
      }
    } else {
      // Register logic
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if username already exists
      if (users.some((u) => u.username === username)) {
        setError('Username already exists');
        return;
      }

      // Add new user
      const newUser = { username, password, createdAt: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      navigate('/gameStart');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900 font-mono">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-purple-900">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-300">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-semibold shadow-lg hover:shadow-xl transition-all w-full"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-purple-400 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

// AuthUtils - Helper functions to use throughout the app
export const isAuthenticated = () => {
  return localStorage.getItem('currentUser') !== null;
};

export const logout = (navigate) => {
  localStorage.removeItem('currentUser');
  navigate('/');
};

export const getUsername = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    return JSON.parse(currentUser).username;
  }
  return '';
};