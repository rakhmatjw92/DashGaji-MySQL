import React from 'react';

// Fix: Made the `icon` prop type more specific to resolve an error with `React.cloneElement`.
// The generic `React.ReactElement` type doesn't guarantee that the component accepts a `className`.
// By typing it as `React.ReactElement<{ className?: string }>`, we inform TypeScript
// that `className` is a valid prop, fixing the overload error.
interface MetricCardProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  value: string | number;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, tooltip }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 transition-all duration-300 hover:border-cyan-500/80 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]">
      <div className="flex items-center gap-4">
        <div className="text-cyan-400">{React.cloneElement(icon, { className: "w-8 h-8" })}</div>
        <div>
            <div className="flex items-center gap-2">
                 <p className="text-sm text-slate-400">{title}</p>
                 {tooltip && (
                    <div className="group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {tooltip}
                        </span>
                    </div>
                 )}
            </div>
          <p className="text-2xl font-bold font-orbitron text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;