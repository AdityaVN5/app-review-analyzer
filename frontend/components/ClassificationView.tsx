import React from 'react';
import { ClassificationData } from '../types';
import { Check, Tag, BarChart3, HardDrive, Terminal } from 'lucide-react';

interface ClassificationViewProps {
  data: ClassificationData;
}

export const ClassificationView: React.FC<ClassificationViewProps> = ({ data }) => {
  const maxCount = Math.max(...data.distribution.map(d => d.count));

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Log & Taxonomy */}
        <div className="space-y-6">
          {/* Simulated CLI Output */}
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-xs text-zinc-300 leading-relaxed shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 border-b border-zinc-800 pb-2">
              <Terminal className="w-3 h-3" />
              <span>Process Log</span>
            </div>
            <p>📂 Loaded {data.totalReviews} reviews.</p>
            <p className="mt-2 text-zinc-400">🔍 PASS 1: Discovering Taxonomy...</p>
            <p className="text-green-400">✅ Taxonomy Locked ({data.taxonomy.length} Categories)</p>
            <p className="mt-2 text-zinc-400">🚀 PASS 2: Classifying reviews...</p>
            <div className="pl-2 border-l border-zinc-700 mt-1 space-y-1 text-zinc-500">
               <p>-> Batch 1/5 processed (100 items)</p>
               <p>-> Batch 2/5 processed (100 items)</p>
               <p>-> Batch 3/5 processed (100 items)</p>
               <p>-> Batch 4/5 processed (100 items)</p>
               <p>-> Batch 5/5 processed ({data.totalReviews % 100} items)</p>
            </div>
            <p className="mt-2 text-green-400">✅ FINAL STATS GENERATED</p>
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
          
          <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
};