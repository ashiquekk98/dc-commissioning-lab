import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export default function InfoTip({ title, itTerm, what, why, lang = 'EN' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex items-center align-middle no-print">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={`Explain ${title}`}
        title={`What is ${title}?`}
        className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full border text-[10px] transition cursor-pointer ${
          open
            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
            : 'bg-slate-800/90 text-cyan-300 border-slate-700 hover:border-cyan-400 hover:bg-slate-800'
        }`}
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-x-4 bottom-4 sm:inset-auto sm:absolute sm:left-0 sm:top-6 z-40 w-auto sm:w-80 rounded-xl bg-slate-900 border border-cyan-500/50 shadow-2xl shadow-slate-950 p-3.5 text-left space-y-2"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <div className="text-xs font-bold text-slate-100">{title}</div>
              {itTerm && (
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                  {lang === 'IT' ? 'Termine Cantiere:' : 'Italian Site Term:'} {itTerm}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300">What it is: </span>
            {what}
          </div>

          {why && (
            <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/80 border border-slate-800 rounded-lg p-2">
              <span className="font-semibold text-emerald-400">Why it matters: </span>
              {why}
            </div>
          )}
        </div>
      )}
    </span>
  );
}