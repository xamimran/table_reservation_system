import React from 'react';

interface LoaderProps {
  size?: string; // Optional size prop
  message?: string; // Optional loading message
}

const DefaultLoader: React.FC<LoaderProps> = ({ size = 'w-12 h-12', message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className={`animate-spin border-4 border-t-transparent border-[#eab24f] rounded-full ${size} shadow-lg`} />
      <span className="ml-4 text-lg text-gray-800 font-semibold animate-pulse">{message}</span>
    </div>
  );
};

export default DefaultLoader;
