import React from 'react';
import '../globals.css';

const GameLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=''>
      {/* Simple Header */}
      <header className='flex-shrink-0 bg-black/80 backdrop-blur border-b border-gray-800'>
        <div className='flex h-12 items-center justify-center px-4'>
          <h1 className='text-lg font-bold text-red'>📸 LaserStrike</h1>
        </div>
      </header>

      {/* Main Camera Area - Takes full remaining space */}
      <main className='flex-1 relative overflow-hidden'>
        {children}
      </main>
    </div>
  );
};

export default GameLayout;
