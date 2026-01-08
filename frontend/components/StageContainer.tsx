import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface StageContainerProps {
  title: string;
  description: string;
  agentName: string;
  status: 'idle' | 'loading' | 'complete' | 'waiting';
  children: React.ReactNode;
  stepNumber: string;
}

export const StageContainer: React.FC<StageContainerProps> = ({
  title,
  description,
  agentName,
  status,
  children,
  stepNumber
}) => {
  const isIdle = status === 'idle' || status === 'waiting';
  
  return (
    <div className={`
      relative border-l-2 pl-8 pb-12 transition-all duration-500
      ${status === 'waiting' ? 'border-zinc-100 opacity-40' : 'border-zinc-200 opacity-100'}
    `}>
      {/* Timeline Indicator */}
      <div className="absolute -left-[9px] top-0 bg-white py-1">
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 text-zinc-900 animate-spin" />
        ) : status === 'complete' ? (
          <CheckCircle2 className="w-4 h-4 text-zinc-900" />
        ) : (
          <Circle className="w-4 h-4 text-zinc-300" />
        )}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
            Cell {stepNumber}
          </span>
          <span className="h-px w-8 bg-zinc-100"></span>
          <span className="font-mono text-xs text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
            {agentName}
          </span>
        </div>
        <h2 className="text-xl font-medium tracking-tight text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-500 mt-1 max-w-lg">{description}</p>
      </div>

      {/* Content Area */}
      <div className={`
        transition-all duration-500 ease-in-out
        ${isIdle ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}
      `}>
        {status === 'loading' ? (
          <div className="h-24 flex items-center justify-start text-sm text-zinc-400 font-mono animate-pulse">
            Processing dataset...
          </div>
        ) : (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};