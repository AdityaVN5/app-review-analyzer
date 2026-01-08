import React from 'react';
import { ClassificationData } from '../types';
import { Check, Tag, BarChart3, HardDrive, Terminal } from 'lucide-react';

interface ClassificationViewProps {
  data: ClassificationData;
  logs: string[];
}

export const ClassificationView: React.FC<ClassificationViewProps> = ({ data, logs }) => {
  const maxCount = Math.max(...data.distribution.map(d => d.count));

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Log & Taxonomy */}
        <div className="space-y-6">
          {/* Real-time CLI Output */}
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-xs text-zinc-300 leading-relaxed shadow-sm h-64 flex flex-col">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 border-b border-zinc-800 pb-2">
              <Terminal className="w-3 h-3" />
              <span>Process Log</span>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-1">
                {logs.length === 0 ? (
                    <span className="text-zinc-600 italic">Waiting for process start...</span>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="break-words">
                            <span className="text-zinc-500 mr-2">{`>`}</span>
                            {log}
                        </div>
                    ))
                )}
                <div className="animate-pulse text-zinc-500">_</div>
            </div>
          </div>

          {/* Locked Taxonomy */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-zinc-500" />
              <h3 className="font-medium text-zinc-900 text-sm">Discovered Taxonomy</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.taxonomy.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2.5 py-1 text-xs font-medium border border-zinc-100 bg-zinc-50 text-zinc-600 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Distribution Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              <h3 className="font-medium text-zinc-900 text-sm">Category Distribution</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Sort: Descending</span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-normal">Topic</th>
                  <th className="px-4 py-3 font-normal text-right w-24">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.distribution.map((item) => (
                  <tr key={item.topic} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-700 relative">
                      <div className="relative z-10 text-xs font-medium">{item.topic}</div>
                      {/* Bar Visualization */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-zinc-100/50 transition-all duration-500 group-hover:bg-zinc-200/50" 
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      ></div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-600">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-xs flex items-center gap-2 text-zinc-500 truncate">
             <HardDrive className="w-3 h-3 flex-shrink-0" />
             <span className="truncate" title={data.savedPath}>{data.savedPath}</span>
          </div>
          
          {data.csvDownloadUrl && (
             <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <a 
                  href={data.csvDownloadUrl} 
                  download 
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800 transition-colors"
                >
                  <HardDrive className="w-3 h-3" />
                  Download CSV
                </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};