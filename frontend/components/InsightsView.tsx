import React, { useState } from 'react';
import { Insights } from '../types';
import { TrendingUp, AlertTriangle, Lightbulb, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface InsightsViewProps {
  data: Insights;
}

// Simple internal component to render markdown-like text structure without external libraries
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="text-zinc-800 text-sm leading-relaxed space-y-4">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Handle Empty lines
        if (!trimmed) return <div key={index} className="h-2" />;

        // Handle Main Headers (e.g., "1. Executive Summary")
        if (/^\d+\.\s/.test(trimmed)) {
            return <h3 key={index} className="text-lg font-semibold text-zinc-900 mt-6 mb-2">{trimmed}</h3>;
        }

        // Handle Metadata (To/From/Subject)
        if (trimmed.startsWith('To:') || trimmed.startsWith('From:') || trimmed.startsWith('Date:') || trimmed.startsWith('Subject:')) {
            return <div key={index} className="font-mono text-xs text-zinc-500 border-l-2 border-zinc-200 pl-2">{trimmed}</div>
        }

        // Handle Subheaders / Bold prefixes (e.g. "Data: ...")
        const boldPrefixMatch = trimmed.match(/^([A-Za-z0-9 &()]+):(.*)/);
        if (boldPrefixMatch) {
             // Check if it's a short header line (likely a sub-section title)
             if (trimmed.length < 50 && !trimmed.includes('.')) {
                 return <h4 key={index} className="font-medium text-zinc-900 mt-4">{trimmed}</h4>
             }
             
             return (
                 <p key={index} className="mb-2">
                     <span className="font-semibold text-zinc-800">{boldPrefixMatch[1]}:</span>
                     {boldPrefixMatch[2]}
                 </p>
             )
        }
        
        // Handle List Items
        if (trimmed.startsWith('- ')) {
            return (
                <li key={index} className="ml-4 list-disc pl-2 marker:text-zinc-400">
                    {trimmed.substring(2)}
                </li>
            )
        }

        // Default Paragraph
        return <p key={index} className="text-zinc-600">{trimmed}</p>;
      })}
    </div>
  );
};

export const InsightsView: React.FC<InsightsViewProps> = ({ data }) => {
  const [showReport, setShowReport] = useState(false);

  // Extract all unique dates from the first dailyStat entry to form columns
  const dates = data.dailyStats.length > 0 ? Object.keys(data.dailyStats[0].counts) : [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trends */}
        <div className="p-5 rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 mb-4 text-zinc-900">
            <TrendingUp className="w-4 h-4" />
            <h3 className="font-medium">Key Trends</h3>
          </div>
          <ul className="space-y-3">
            {data.trends.map((item, idx) => (
              <li key={idx} className="text-sm text-zinc-600 leading-relaxed border-l-2 border-zinc-100 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="p-5 rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 mb-4 text-zinc-900">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-medium">Emerging Risks</h3>
          </div>
          <ul className="space-y-3">
            {data.risks.map((item, idx) => (
              <li key={idx} className="text-sm text-zinc-600 leading-relaxed border-l-2 border-red-100 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-5 rounded-lg border border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2 mb-4 text-zinc-900">
            <Lightbulb className="w-4 h-4" />
            <h3 className="font-medium">Action Items</h3>
          </div>
          <ul className="space-y-3">
            {data.recommendations.map((item, idx) => (
              <li key={idx} className="text-sm text-zinc-600 leading-relaxed list-disc list-inside marker:text-zinc-300">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      {data.dailyStats.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <h3 className="font-medium text-zinc-900">Daily Topic Volume</h3>
          </div>
          {/* Added pb-3 to ensure scrollbar doesn't overlap content and looks integrated */}
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
          <div className="mt-4 bg-white border border-zinc-200 rounded-lg p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <MarkdownRenderer content={data.markdownReport} />
          </div>
        )}
      </div>
    </div>
  );
};