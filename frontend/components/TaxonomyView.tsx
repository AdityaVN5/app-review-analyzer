import React from 'react';
import { Taxonomy } from '../types';

interface TaxonomyViewProps {
  data: Taxonomy;
}

export const TaxonomyView: React.FC<TaxonomyViewProps> = ({ data }) => {
  const renderGroup = (title: string, items: string[], colorClass: string) => (
    <div className="mb-6 last:mb-0">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span 
            key={item} 
            className={`
              px-2.5 py-1 text-sm border rounded-md transition-colors cursor-default
              ${colorClass}
            `}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-50/50 border border-zinc-100 rounded-lg p-6 max-w-3xl">
      {renderGroup("Issues (Severity High)", data.issues, "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300")}
      {renderGroup("Features (Functional)", data.features, "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300")}
      {renderGroup("Thematic Categories", data.themes, "bg-zinc-100 border-transparent text-zinc-600")}
    </div>
  );
};