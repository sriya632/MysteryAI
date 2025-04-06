import React, { useState, useEffect } from 'react';

const Timer = ({ onTimePause, onTimeResume }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [wasRunning, setWasRunning] = useState(true); // Track previous state

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    // Avoid calling on first render
    if (wasRunning !== isRunning) {
      if (isRunning) {
        onTimeResume?.();
      } else {
        onTimePause?.();
      }
    }
    setWasRunning(isRunning);
  }, [isRunning]);

  const togglePause = () => {
    setIsRunning(prev => !prev);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <div
        className={`text-xl font-bold ${
          time > 1800 ? 'text-red-500' : 'text-white'
        }`}
      >
        {formatTime(time)}
      </div>
      <button
        onClick={togglePause}
        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white"
      >
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
};

export default Timer;
