import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw, ShieldAlert } from 'lucide-react';
import { calculateTopology } from '../utils/engineeringMath';

export default function TopologySim() {
  const [mode, setMode] = useState('distributed');
  const [numUnits, setNumUnits] = useState(5);
  const [unitRatingMW, setUnitRatingMW] = useState(2.5);
  const [totalLoadMW, setTotalLoadMW] = useState(8.8);
  const [trippedIndex, setTrippedIndex] = useState(null);

  const result = calculateTopology({
    mode,
    numUnits,
    unitRatingMW,
    totalLoadMW,
    trippedIndex,
  });

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setTrippedIndex(null);
  };

  const handleUnitCountChange = (count) => {
    setNumUnits(count);
    setTrippedIndex(null);
  };

  const triggerRandomTrip = () => {
    if (trippedIndex !== null) {
      setTrippedIndex(null);
    } else {
      setTrippedIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        {/* Topology Selector */}
        <div className="lg:col-span-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            UPS Architecture
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange('distributed')}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition text-left ${
                mode === 'distributed'
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>Distributed (N-to-N-1)</div>
              <div className="text-[11px] font-normal opacity-80">Shared concurrent load</div>
            </button>
            <button
              onClick={() => handleModeChange('catcher')}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition text-left ${
                mode === 'catcher'
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>Block (N+1 Catcher)</div>
              <div className="text-[11px] font-normal opacity-80">STS reserve transfer</div>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Lineups</span>
              <span className="font-mono font-semibold text-slate-200">{numUnits} Units</span>
            </div>
            <input
              type="range"
              min={3}
              max={6}
              step={1}
              value={numUnits}
              onChange={(e) => handleUnitCountChange(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Unit Rating</span>
              <span className="font-mono font-semibold text-slate-200">{unitRatingMW.toFixed(1)} MW</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={4.0}
              step={0.5}
              value={unitRatingMW}
              onChange={(e) => setUnitRatingMW(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Critical IT Load</span>
              <span className="font-mono font-semibold text-cyan-300">{totalLoadMW.toFixed(1)} MW</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={18.0}
              step={0.2}
              value={totalLoadMW}
              onChange={(e) => setTotalLoadMW(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Fault Injection Action */}
        <div className="lg:col-span-3 flex flex-col justify-center gap-2">
          <button
            onClick={triggerRandomTrip}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              trippedIndex !== null
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
            }`}
          >
            {trippedIndex !== null ? (
              <>
                <RotateCcw className="w-4 h-4" /> Restore All Lineups
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Simulate Lineup Trip
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-400">
            Click any UPS module below to trip or restore it
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Topology Scheme</div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">{result.redundancyLabel}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Firm (N-1) Capacity</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {result.firmCapacityMW} MW
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Peak Lineup Load</div>
          <div
            className={`text-lg font-bold font-mono mt-0.5 ${
              result.anyOverload ? 'text-rose-400' : 'text-cyan-300'
            }`}
          >
            {result.maxUnitLoadPct.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">System Health</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            {result.anyOverload ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Overload / Bypass
              </span>
            ) : trippedIndex !== null ? (
              <span className="text-amber-300 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> N-1 Degraded Safe
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Healthy Redundant
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Lineup Bus Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {result.units.map((unit) => {
          const barWidth = Math.min(100, unit.loadPct);
          let borderClass = 'border-slate-800 bg-slate-900/70 hover:border-slate-700';
          let barColor = 'bg-emerald-500';

          if (unit.isTripped) {
            borderClass = 'border-rose-500/70 bg-rose-950/25';
            barColor = 'bg-rose-500';
          } else if (unit.isOverloaded) {
            borderClass = 'border-rose-500 bg-rose-950/30 animate-pulse';
            barColor = 'bg-rose-500';
          } else if (unit.stsTransferred) {
            borderClass = 'border-amber-400/70 bg-amber-950/20';
            barColor = 'bg-amber-400';
          } else if (unit.loadPct > 85) {
            barColor = 'bg-amber-400';
          }

          return (
            <button
              key={unit.id}
              onClick={() => setTrippedIndex(unit.isTripped ? null : unit.id)}
              className={`text-left rounded-xl border p-4 transition cursor-pointer flex flex-col justify-between ${borderClass}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-100">{unit.label}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      unit.isTripped
                        ? 'bg-rose-500/20 text-rose-300'
                        : unit.stsTransferred
                        ? 'bg-amber-500/20 text-amber-300'
                        : unit.loadMW === 0
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {unit.isTripped
                      ? 'TRIPPED'
                      : unit.stsTransferred
                      ? 'STS ACTIVE'
                      : unit.loadMW === 0
                      ? 'STANDBY'
                      : 'ONLINE'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{unit.role}</div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-mono font-bold text-slate-100">
                    {unit.loadMW.toFixed(2)} <span className="text-xs font-normal text-slate-400">MW</span>
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {unit.loadPct.toFixed(0)}% / {unitRatingMW.toFixed(1)}MW
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Commissioning Engineer Note */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-emerald-400">IST Commissioning Insight: </span>
        {mode === 'distributed'
          ? `In a ${numUnits}-to-${
              numUnits - 1
            } distributed redundant plant, each lineup normally runs below ${Math.round(
              ((numUnits - 1) / numUnits) * 100
            )}% capacity so any single bus failure redistributes seamlessly across the remaining ${
              numUnits - 1
            } lineups without Static Transfer Switch (STS) break-before-make transfer risk.`
          : `In a (${
              numUnits - 1
            })+1 Block Redundant (Catcher) topology, primary lineups operate near full rating while the Catcher sits unloaded on standby. During Level 5 IST, verify STS transfer time (< 4–6 ms) and step-load acceptance on the Catcher UPS inverters.`}
      </div>
    </div>
  );
}