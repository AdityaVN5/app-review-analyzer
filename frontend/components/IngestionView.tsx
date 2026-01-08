import React from 'react';
import { IngestionData } from '../types';
import { FileText, Database, HardDrive, Star } from 'lucide-react';

interface IngestionViewProps {
  data: IngestionData;
}

export const IngestionView: React.FC<IngestionViewProps> = ({ data }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-white rounded-md border border-zinc-100 text-zinc-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-zinc-900">{data.totalReviews}</div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wide">Total Reviews</div>
          </div>
        </div>
        
        <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-white rounded-md border border-zinc-100 text-zinc-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-zinc-900">~{data.tokenCount}</div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wide">Token Count</div>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-white rounded-md border border-zinc-100 text-zinc-500">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-zinc-900 truncate" title={data.savedPath}>
              {data.savedPath.split('/').pop()}
            </div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wide">File Saved</div>
          </div>
        </div>
      </div>

      {/* Sample Table */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <div className="bg-zinc-50/50 px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sample Reviews (First 10)</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 font-medium">
            <tr>
              <th className="px-4 py-2 font-normal w-36">Date</th>
              <th className="px-4 py-2 font-normal">Content</th>
              <th className="px-4 py-2 font-normal w-16 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {data.samples.map((sample, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-500 whitespace-nowrap">
                  {sample.date.split(' ')[0]} <span className="text-zinc-300">|</span> {sample.date.split(' ')[1]}
                </td>
                <td className="px-4 py-2.5 text-zinc-700">
                  {sample.content}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`inline-flex items-center gap-1 px-1.5 rounded text-xs font-medium ${
                    sample.score >= 4 ? 'bg-green-50 text-green-700' :
                    sample.score <= 2 ? 'bg-red-50 text-red-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {sample.score} <Star className="w-3 h-3 fill-current" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};