'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const avatarList = [1, 2, 3, 4, 5];

export default function AvatarSelector() {
  const [showPanel, setShowPanel] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-100 mb-2">
        Avatar
      </label>
      <button
        type="button"
        className="flex items-center space-x-3 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg text-white hover:bg-gray-800 transition w-full"
        onClick={() => setShowPanel(true)}
      >
        {selected ? (
          <Image
            src={`/images/avatars/${selected}.png`}
            alt={`Avatar ${selected}`}
            width={32}
            height={32}
            className="rounded-full border border-gray-700"
          />
        ) : (
          <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xl border border-gray-600">?</span>
        )}
        <span className="flex-1 text-left">{selected ? `Avatar ${selected}` : 'Select Avatar'}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-black/90 backdrop-blur rounded-2xl shadow-2xl border border-red-500/20 p-8 w-full max-w-md">
            <div className="mb-6 text-white font-bold text-xl text-center">Choose your Avatar</div>
            <div className="grid grid-cols-3 gap-6 mb-6 justify-items-center">
              {avatarList.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`focus:outline-none rounded-full border-4 transition-all duration-150 ${
                    selected === num
                      ? 'border-red-500 scale-110 shadow-lg'
                      : 'border-transparent hover:border-red-400 hover:scale-105'
                  }`}
                  onClick={() => {
                    setSelected(num);
                    setShowPanel(false);
                  }}
                >
                  <Image
                    src={`/images/avatars/${num}.png`}
                    alt={`Avatar ${num}`}
                    width={72}
                    height={72}
                    className="rounded-full bg-gray-800"
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="w-full py-3 bg-red-700 text-white rounded-lg text-lg font-semibold hover:bg-red-800 transition"
              onClick={() => setShowPanel(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}