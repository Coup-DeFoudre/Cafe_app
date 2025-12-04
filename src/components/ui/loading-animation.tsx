'use client';

import { useEffect, useState } from 'react';

export function CableLoadingAnimation() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setConnected(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#FAF7F2] to-[#F5E6D3]">
      <div className="relative w-64 h-32 mb-8">
        {/* Left plug */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-500 ${connected ? 'translate-x-[72px]' : 'translate-x-0'}`}>
          <div className="flex items-center">
            <div className="w-12 h-8 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-l-lg shadow-lg" />
            <div className="flex flex-col gap-1">
              <div className="w-8 h-2 bg-[#DAA520] rounded-r-full shadow-md" />
              <div className="w-8 h-2 bg-[#DAA520] rounded-r-full shadow-md" />
            </div>
          </div>
        </div>

        {/* Right socket */}
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ${connected ? '-translate-x-[72px]' : 'translate-x-0'}`}>
          <div className="flex items-center">
            <div className="flex flex-col gap-1">
              <div className="w-8 h-2 bg-[#2D2D2D] rounded-l-full shadow-inner" />
              <div className="w-8 h-2 bg-[#2D2D2D] rounded-l-full shadow-inner" />
            </div>
            <div className="w-12 h-8 bg-gradient-to-l from-[#8B4513] to-[#A0522D] rounded-r-lg shadow-lg" />
          </div>
        </div>

        {/* Spark effect when connecting */}
        {connected && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75" />
              <div className="w-4 h-4 bg-yellow-300 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className={`text-lg font-medium transition-all duration-300 ${connected ? 'text-green-600' : 'text-[#6B6B6B]'}`}>
          {connected ? '✓ Connected!' : 'Connecting...'}
        </p>
        <p className="text-sm text-[#8B8B8B] mt-2">
          {connected ? 'Loading your content...' : 'Establishing connection'}
        </p>
      </div>

      {/* Coffee cup animation below */}
      <div className="mt-8">
        <div className="relative">
          <div className="w-16 h-12 bg-[#8B4513] rounded-b-3xl rounded-t-sm relative overflow-hidden">
            {/* Coffee liquid with wave animation */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#3E2723] to-[#5D4037] animate-pulse" />
            {/* Steam */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1 h-4 bg-gray-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-6 bg-gray-300 rounded-full animate-bounce opacity-40" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-4 bg-gray-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
          {/* Cup handle */}
          <div className="absolute right-[-10px] top-2 w-4 h-6 border-4 border-[#8B4513] rounded-r-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminLoadingAnimation() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
      {/* Network/Data flow animation */}
      <div className="relative w-48 h-48 mb-8">
        {/* Central hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white rounded-lg animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-4 h-4"
            style={{
              animation: `orbit 2s linear infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <div 
              className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-md"
              style={{
                transform: `translateX(${60}px) translateY(-50%)`,
              }}
            />
          </div>
        ))}

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray="8 4"
            className="animate-spin"
            style={{ animationDuration: '8s', transformOrigin: 'center' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-150 rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <p className="text-gray-600 font-medium">Loading dashboard...</p>
      <p className="text-sm text-gray-400 mt-1">Fetching latest data</p>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export function SimpleSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-[#E8D5B7] rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-[#8B4513] rounded-full animate-spin" />
      </div>
      <p className="text-[#6B6B6B] font-medium">{text}</p>
    </div>
  );
}

