import React, { useState } from 'react';
import { Fuel, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { calculateWetStacking } from '../utils/engineeringMath';

export default function WetStackingSim() {
  const [ratingKVA, setRatingKVA] = useState(2500);
  const [powerFactor, setPowerFactor] = useState(0.8);
  const [actualLoadKW, setActualLoadKW] = useState(480);
  const [runHours, setRunHours] = useState(6);

  const result = calculateWetStacking({
    ratingKVA,
    powerFactor,
    actualLoadKW,
    runHours,
  });

  const barPct = Math.min(100, result.loadPct);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Generator Rating</span>
            <span className="font-mono font-semibold text-slate-100">{ratingKVA} kVA</span>
          </div>
          <input
            type="range"
            min={500}
            max={4000}
            step={250}
            value={ratingKVA}
            onChange={(e) => setRatingKVA(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Power Factor (cos φ)</span>
            <span className="font-mono font-semibold text-slate-100">{powerFactor.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.75}
            max={1.0}
            step={0.05}
            value={powerFactor}
            onChange={(e) => setPowerFactor(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Actual Site Load</span>
            <span className="font-mono font-semibold text-cyan-300">{actualLoadKW} kW</span>
          </div>
          <input
            type="range"
            min={100}
            max={3000}
            step={20}
            value={actualLoadKW}
            onChange={(e) => setActualLoadKW(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Run Duration</span>
            <span className="font-mono font-semibold text-amber-300">{runHours} hrs</span>
          </div>
          <input
            type="range"
            min={1}
            max={24}
            step={1}
            value={runHours}
            onChange={(e) => setRunHours(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Loading Gauge */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Fuel className="w-4 h-4 text-amber-400" />
            <span>Engine Active Load Factor</span>
          </div>
          <div className="font-mono text-sm">
            <span className="font-bold text-slate-100">{actualLoadKW} kW</span>
            <span className="text-slate-400"> / {result.ratedKW.toFixed(0)} kW Rated </span>
            <span
              className={`font-bold ${
                result.riskLevel === 'high'
                  ? 'text-rose-400'
                  : result.riskLevel === 'moderate'
                  ? 'text-amber-300'
                  : 'text-emerald-400'
              }`}
            >
              ({result.loadPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Threshold Progress Bar */}
        <div className="relative w-full h-5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          {/* 30% Danger Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
            style={{ left: '30%' }}
            title="30% Wet-Stacking Threshold"
          />
          {/* 50% Optimal Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10"
            style={{ left: '50%' }}
            title="50% Optimal Combustion Threshold"
          />
          <div
            className={`h-full transition-all duration-300 ${
              result.riskLevel === 'high'
                ? 'bg-rose-500'
                : result.riskLevel === 'moderate'
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${barPct}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>0%</span>
          <span className="text-rose-400">30% Wet-Stacking Limit ({result.minSafeKW.toFixed(0)} kW)</span>
          <span className="text-emerald-400">50% Clean Burn</span>
          <span>100%</span>
        </div>
      </div>

      {/* Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`md:col-span-2 rounded-xl border p-5 space-y-2 ${
            result.riskLevel === 'high'
              ? 'bg-rose-950/20 border-rose-500/40'
              : result.riskLevel === 'moderate'
              ? 'bg-amber-950/20 border-amber-500/40'
              : 'bg-emerald-950/20 border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            {result.riskLevel === 'high' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : result.riskLevel === 'moderate' ? (
              <ShieldAlert className="w-4 h-4 text-amber-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-slate-100">{result.riskTitle}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{result.recommendation}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400">Load-Bank Burn-Off Target</div>
            <div className="text-2xl font-mono font-bold text-amber-300 mt-1">
              {result.burnOffHours > 0 ? `${result.burnOffHours} hrs` : 'None Needed'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {result.burnOffHours > 0
              ? `Run resistive load bank at ≥ ${result.recommendedLoadBankKW.toFixed(0)} kW (75%)`
              : 'Engine exhaust temperature is within OEM clean-burn envelope'}
          </div>
        </div>
      </div>
    </div>
  );
}