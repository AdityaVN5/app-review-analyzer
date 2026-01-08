import React, { useState } from 'react';
import { Insights } from '../types';
import { Calendar, FileText, ChevronDown, ChevronUp, HardDrive } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InsightsViewProps {
  data: Insights;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ data }) => {
  const [showReport, setShowReport] = useState(true); // Default to open now since cards are gone

  // Extract all unique dates from the first dailyStat entry to form columns
  const dates = data.dailyStats.length > 0 ? Object.keys(data.dailyStats[0].counts) : [];

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Daily Breakdown Table */}
      {data.dailyStats.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <h3 className="font-medium text-zinc-900">Daily Topic Volume</h3>
            </div>
            {data.dailyStatsCsvDownloadUrl && (
                <a 
                  href={data.dailyStatsCsvDownloadUrl} 
                  download 
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium rounded-md hover:bg-zinc-50 transition-colors shadow-sm"
                >
                  <HardDrive className="w-3 h-3" />
                  Download CSV
                </a>
            )}
          </div>
          <div className="overflow-x-auto pb-3">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-3 font-medium text-zinc-900 w-48 sticky left-0 bg-zinc-50 border-r border-zinc-100 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)] z-10">Topic</th>
                  {dates.map(date => (
                    <th key={date} className="px-4 py-3 font-normal whitespace-nowrap text-center text-zinc-500">
                      {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.dailyStats.map((stat, idx) => (
                  <tr key={stat.topic} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-zinc-800 sticky left-0 bg-white border-r border-zinc-100 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)] z-10">
                      {stat.topic}
                    </td>
                    {dates.map(date => (
                      <td key={date} className="px-4 py-3 text-center font-mono text-zinc-600">
                        {stat.counts[date]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategic Report Section */}
      <div className="pt-2">
        <button
          onClick={() => setShowReport(!showReport)}
          className="flex items-center justify-between w-full p-4 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-zinc-300 group-hover:text-white" />
            <span className="font-medium">Strategic Trend Analysis Report</span>
          </div>
          {showReport ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        {showReport && (
          <div className="mt-4 bg-white border border-zinc-200 rounded-lg p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 prose prose-zinc max-w-none prose-sm">
             <ReactMarkdown>{data.markdownReport}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};