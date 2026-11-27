import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { calculateTopology } from '../utils/engineeringMath';

const PRESETS = [
  {
    label: '64 MW Hyperscale (8-to-7)',
    mode: 'distributed',
    numUnits: 8,
    unitRatingMW: 3.0,
    totalLoadMW: 20.0,
    trips: [0],
  },
  {
    label: '16 MW Colo (5-to-4)',
    mode: 'distributed',
    numUnits: 5,
    unitRatingMW: 2.5,
    totalLoadMW: 8.8,
    trips: [],
  },
  {
    label: 'N-2 Maint + Fault Stress',
    mode: 'distributed',
    numUnits: 6,
    unitRatingMW: 2.5,
    totalLoadMW: 11.5,
    trips: [0, 1],
  },
  {
    label: 'Block Catcher (4+1 STS)',
    mode: 'catcher',
    numUnits: 5,
    unitRatingMW: 2.5,
    totalLoadMW: 9.2,
    trips: [1],
  },
];

const TOPIC_CARDS = [
  {
    id: 'dist-vs-block',
    title: 'Distributed (N-to-N-1) vs. Block (N+1 Catcher)',
    detail:
      'Distributed redundancy shares the IT load concurrently across N independent UPS lineups—there are no Static Transfer Switches (STS) in the critical path. Block Redundant runs primary lineups near 90–100% and relies on an unloaded Catcher UPS transferring via STS within < 4–6 ms during a fault.',
  },
  {
    id: 'concurrent-maint',
    title: 'Testing N-2 (Maintenance + Unexpected Fault)',
    detail:
      'Click two UPS cards below to simulate taking one lineup offline for scheduled preventive maintenance while a second lineup unexpectedly trips. Watch how peak lineup loading jumps and whether the remaining buses stay below 100% rating.',
  },
];

export default function TopologySim({ lang }) {
  const [mode, setMode] = useState('distributed');
  const [numUnits, setNumUnits] = useState(6);
  const [unitRatingMW, setUnitRatingMW] = useState(2.5);
  const [totalLoadMW, setTotalLoadMW] = useState(11.0);
  const [trippedIndices, setTrippedIndices] = useState([]);
  const [openTopic, setOpenTopic] = useState(null);

  const result = calculateTopology({
    mode,
    numUnits,
    unitRatingMW,
    totalLoadMW,
    trippedIndices,
  });

  const applyPreset = (p) => {
    setMode(p.mode);
    setNumUnits(p.numUnits);
    setUnitRatingMW(p.unitRatingMW);
    setTotalLoadMW(p.totalLoadMW);
    setTrippedIndices(p.trips);
  };

  const toggleUnitTrip = (id) => {
    setTrippedIndices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Scenario Presets */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {lang === 'IT' ? 'Scenari Rapidi:' : 'Presets:'}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="lg:col-span-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {lang === 'IT' ? 'Architettura Quadri UPS' : 'UPS Architecture'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMode('distributed');
                setTrippedIndices([]);
              }}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition text-left cursor-pointer ${
                mode === 'distributed'
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>Distributed (N-to-N-1)</div>
              <div className="text-[11px] font-normal opacity-80">Shared concurrent load</div>
            </button>
            <button
              onClick={() => {
                setMode('catcher');
                setTrippedIndices([]);
              }}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition text-left cursor-pointer ${
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

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{lang === 'IT' ? 'Linee UPS' : 'Lineups'}</span>
              <span className="font-mono font-semibold text-slate-200">{numUnits} Units</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={1}
              value={numUnits}
              onChange={(e) => {
                setNumUnits(Number(e.target.value));
                setTrippedIndices([]);
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{lang === 'IT' ? 'Taglia UPS' : 'Unit Rating'}</span>
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
              <span className="text-slate-400">{lang === 'IT' ? 'Carico IT' : 'Critical IT Load'}</span>
              <span className="font-mono font-semibold text-cyan-300">{totalLoadMW.toFixed(1)} MW</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={36.0}
              step={0.5}
              value={totalLoadMW}
              onChange={(e) => setTotalLoadMW(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col justify-center gap-2 no-print">
          <button
            onClick={() => setTrippedIndices(trippedIndices.length > 0 ? [] : [0])}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              trippedIndices.length > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
            }`}
          >
            {trippedIndices.length > 0 ? (
              <>
                <RotateCcw className="w-4 h-4" /> Restore All ({trippedIndices.length} Offline)
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> {lang === 'IT' ? 'Simula Scatto Linea' : 'Simulate Lineup Trip'}
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-400">
            Click 1 or more UPS cards below to test N-1 / N-2
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
                <AlertTriangle className="w-4 h-4" /> Overload / Load Loss
              </span>
            ) : trippedIndices.length > 0 ? (
              <span className="text-amber-300 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> N-{trippedIndices.length} Degraded Safe
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
              onClick={() => toggleUnitTrip(unit.id)}
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

      {/* Clickable Subject Explainers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 no-print">
        {TOPIC_CARDS.map((card) => {
          const isOpen = openTopic === card.id;
          return (
            <div
              key={card.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenTopic(isOpen ? null : card.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-emerald-300 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  {card.title}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/70 pt-2.5">
                  {card.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}