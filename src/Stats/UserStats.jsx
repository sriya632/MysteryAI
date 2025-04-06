import React, { useState, useEffect } from 'react';

const UserStats = () => {
  const [gameStats, setGameStats] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = () => {
      setLoading(true);
      
      // Get current user from localStorage
      const currentUser = localStorage.getItem('currentUser');
      
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(currentUser);
      setUsername(userData.username);
      
      // Get user game history from localStorage
      const userGames = JSON.parse(localStorage.getItem(`games_${userData.username}`) || '[]');
      
      // Sort games by timestamp (newest first) and take the last 5
      const sortedGames = userGames
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
        
      setGameStats(sortedGames);
      setLoading(false);
    };
    
    fetchUserStats();
  }, []);
  
  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "--:--:--";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate average solve time
  const calculateAverage = () => {
    if (gameStats.length === 0) return null;
    
    const totalTime = gameStats.reduce((sum, game) => sum + (game.timeTaken || 0), 0);
    return Math.floor(totalTime / gameStats.length);
  };
  
  const averageTime = calculateAverage();

  if (loading) {
    return <div className="text-center py-4">Loading stats...</div>;
  }

  if (gameStats.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6 text-center">
        <h3 className="text-xl font-semibold text-purple-300 mb-2">Your Game History</h3>
        <p className="text-gray-400">No games played yet. Generate a case to start playing!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6">
      <h3 className="text-xl font-semibold text-purple-300 mb-4">Your Recent Games</h3>
      
      {averageTime !== null && (
        <div className="mb-4 text-center">
          <span className="text-gray-300">Average Time: </span>
          <span className="font-bold text-white">{formatTime(averageTime)}</span>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-800">
              <th className="text-left py-2 px-2 text-purple-200">Case</th>
              <th className="text-center py-2 px-2 text-purple-200">Result</th>
              <th className="text-right py-2 px-2 text-purple-200">Time</th>
              <th className="text-right py-2 px-2 text-purple-200">Date</th>
            </tr>
          </thead>
          <tbody>
            {gameStats.map((game, index) => (
              <tr key={index} className="border-b border-slate-700">
                <td className="py-2 px-2 text-white truncate max-w-[150px]">
                  {game.caseTitle || "Mystery Case"}
                </td>
                <td className="py-2 px-2 text-center">
                  {game.solved ? (
                    <span className="text-green-400">Solved</span>
                  ) : (
                    <span className="text-red-400">Failed</span>
                  )}
                </td>
                <td className="py-2 px-2 text-right text-white">
                  {formatTime(game.timeTaken)}
                </td>
                <td className="py-2 px-2 text-right text-gray-400">
                  {new Date(game.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserStats;