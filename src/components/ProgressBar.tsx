"use client";

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-3 border border-white/30 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg animate-pulse-slow"
        style={{ width: `${progress}%` }}
      />
      {label && (
        <div className="text-xs font-medium text-gray-700 mt-1 text-right">
          {label} ({Math.round(progress)}%)
        </div>
      )}
    </div>
  );
}
