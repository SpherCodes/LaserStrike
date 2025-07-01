import React from 'react';
import '../globals.css';

const GameLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=''>
      {/* Removed global header to allow page-level header to show */}
      <main className='flex-1 relative overflow-hidden'>
        {children}
      </main>
    </div>
  );
};

export default GameLayout;
