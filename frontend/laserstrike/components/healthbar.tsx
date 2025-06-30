import React from 'react';

interface HealthBarProps {
  current: number; // current health (e.g., 7)
  max?: number;     // max health, default 10
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max = 10 }) => {
  // Calculate percentage of current health
  const healthPercent = (current / max) * 100;

  // Decide color based on health percentage
  let color = 'bg-green-500';
  if (healthPercent < 30) {
    color = 'bg-red-500';
  } else if (healthPercent < 70) {
    color = 'bg-orange-400';
  }

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-6 border border-black ${
            i < current ? color : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export default HealthBar;