
import React from 'react';

const FeedShimmer: React.FC = () => {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-40 bg-slate-50 rounded-3xl mb-4"></div>
          <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};

export default FeedShimmer;
