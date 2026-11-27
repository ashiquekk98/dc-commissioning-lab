import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, Flame } from 'lucide-react';
import {
  calculateProtectionCoordination,
  computeBreakerTripTime,
} from '../utils/engineeringMath';

const PRESETS = [
  {
    label: 'Coordinated PDU Feeder (25 kA)',
    faultKA: 25,
    loc: 'downstream',
    downIr: 1250,
    downIsd: 4,
    downDelay: 0.1,
    downIi: 12,
    upIr: 3200,
    upIsd: 4,
    upDelay: 0.3,
    upIi: 15,
  },
  {
    label: 'Instantaneous Overlap Blackout',
    faultKA: 28,
    loc: 'downstream',
    downIr: 1250,
    downIsd: 4,
    downDelay: 0.1,
    downIi: 10,
    upIr: 3200,
    upIsd: 4,
    upDelay: 0.3,
    upIi: 6,
  },
  {
    label: 'High Arc-Flash Exposure (42 kA Main)',
    faultKA: 42,
    loc: 'main',
    downIr: 1250,
    downIsd: 4,
    downDelay: 0.1,
    downIi: 12,
    upIr: 3200,
    upIsd: 5,
    upDelay: 0.45,
    upIi: 15,
  },
];

export default function ProtectionSim({ lang }) {
  const [faultCurrentKA, setFaultCurrentKA] = useState(25);
  const [faultLocation, setFaultLocation] = useState('downstream');

  // Downstream Feeder Breaker
  const [downIrA, setDownIrA] = useState(1250);
  const [downIsdMult, setDownIsdMult] = useState(4);
  const [downDelayS, setDownDelayS] = useState(0.1);
  const [downIiMult, setDownIiMult] = useState(12);

  // Upstream Main Incomer Breaker
  const [upIrA, setUpIrA] = useState(3200);
  const [upIsdMult, setUpIsdMult] = useState(4);
  const [upDelayS, setUpDelayS] = useState(0.3);
  const [upIiMult, setUpIiMult] = useState(15);

  const res = calculateProtectionCoordination({
    faultCurrentKA,
    faultLocation,
    downIrA,
    downIsdMult,
    downDelayS,
    downIiMult,
    upIrA,
    upIsdMult,
    upDelayS,
    upIiMult,
  });

  const applyPreset = (p) => {
    setFaultCurrentKA(p.faultKA);
    setFaultLocation(p.loc);
    setDownIrA(p.downIr);
    setDownIsdMult(p.downIsd);
    setDownDelayS(p.downDelay);
    setDownIiMult(p.downIi);
    setUpIrA(p.upIr);
    setUpIsdMult(p.upIsd);
    setUpDelayS(p.upDelay);
    setUpIiMult(p.upIi);
  };

  // Log-Log SVG Time-Current Curve (TCC) mapping
  // Current I: 500 A to 80,000 A | Time t: 0.01 s to 50 s
  const W = 560;
  const H = 320;
  const padL = 52;
  const padR = 20;
  const padT = 20;
  const padB = 38;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const logIMin = Math.log10(500);
  const logIMax = Math.log10(80000);
  const logTMin = Math.log10(0.01);
  const logTMax = Math.log10(50);

  const toX = (currA) => {
    const c = Math.max(500, Math.min(80000, currA));
    return padL + ((Math.log10(c) - logIMin) / (logIMax - logIMin)) * plotW;
  };
  const toY = (timeS) => {
    const t = Math.max(0.01, Math.min(50, timeS));
    return padT + plotH - ((Math.log10(t) - logTMin) / (logTMax - logTMin)) * plotH;
  };

  const buildCurvePath = (irA, isdMult, delayS, iiMult, instS) => {
    const pts = [];
    const steps = 140;
    for (let s = 0; s <= steps; s++) {
      const logI = logIMin + (s / steps) * (logIMax - logIMin);
      const currA = Math.pow(10, logI);
      const t = computeBreakerTripTime(currA, irA, isdMult, delayS, iiMult, instS);
      if (t !== null && t <= 50) {
        pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toX(currA).toFixed(1)} ${toY(t).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  };

  const downPath = buildCurvePath(downIrA, downIsdMult, downDelayS, downIiMult, 0.02);
  const upPath = buildCurvePath(upIrA, upIsdMult, upDelayS, upIiMult, 0.025);
  const faultX = toX(res.faultA);

  return (
    <div className="space-y-6">
      {/* 1-Click Presets */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {lang === 'IT' ? 'Scenari Selettività:' : 'Presets:'}
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

      {/* Fault Injection Top Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="lg:col-span-5 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {lang === 'IT' ? 'Punto di Guasto (Cortocircuito)' : 'Injected Fault Location'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFaultLocation('downstream')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                faultLocation === 'downstream'
                  ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Downstream Feeder
            </button>
            <button
              onClick={() => setFaultLocation('main')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                faultLocation === 'main'
                  ? 'bg-rose-500/15 border-rose-500/60 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Main Switchboard Bus
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">
              {lang === 'IT' ? 'Corrente di Cortocircuito (Icc)' : 'Prospective Short-Circuit Fault Current'}
            </span>
            <span className="font-mono font-bold text-rose-400">
              {faultCurrentKA} kA ({(faultCurrentKA * 1000).toLocaleString()} A)
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={65}
            step={1}
            value={faultCurrentKA}
            onChange={(e) => setFaultCurrentKA(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Coordination & Arc-Flash Status Banner */}
      <div
        className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          res.status === 'coordinated'
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : res.status === 'marginal' || res.status === 'main-fault'
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
            : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {res.status === 'coordinated' ? (
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          ) : res.status === 'uncoordinated' ? (
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="text-xs sm:text-sm font-bold">{res.statusTitle}</div>
            <div className="text-xs opacity-90 mt-0.5">{res.statusDetail}</div>
          </div>
        </div>
        {res.gradingMarginMs !== null && (
          <div className="font-mono text-xs bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
            Δt Margin: <strong>{res.gradingMarginMs} ms</strong>
          </div>
        )}
      </div>

      {/* TCC Log-Log Plot + Breaker Relay Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TCC SVG */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-200">
              Time-Current Coordination Curve (Log-Log TCC)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Downstream
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Upstream Main
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Fault ({faultCurrentKA}kA)
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
            {[1000, 3000, 10000, 30000, 65000].map((curr) => (
              <g key={curr}>
                <line
                  x1={toX(curr)}
                  y1={padT}
                  x2={toX(curr)}
                  y2={padT + plotH}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={toX(curr)}
                  y={H - 12}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {curr >= 1000 ? `${curr / 1000}kA` : `${curr}A`}
                </text>
              </g>
            ))}

            {[0.02, 0.1, 0.5, 2, 10, 50].map((t) => (
              <g key={t}>
                <line
                  x1={padL}
                  y1={toY(t)}
                  x2={padL + plotW}
                  y2={toY(t)}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={toY(t) + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {t}s
                </text>
              </g>
            ))}

            <text
              x={padL + plotW / 2}
              y={H - 1}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              Current (Amperes — Log Scale)
            </text>
            <text
              x={12}
              y={padT + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90, 12, ${padT + plotH / 2})`}
              className="fill-slate-400 text-[10px]"
            >
              Trip Time (Seconds — Log Scale)
            </text>

            {/* Breaker Curves */}
            <path d={upPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
            <path d={downPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

            {/* Fault Line */}
            <line
              x1={faultX}
              y1={padT}
              x2={faultX}
              y2={padT + plotH}
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {res.tDown !== null && (
              <circle cx={faultX} cy={toY(res.tDown)} r="5" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.5" />
            )}
            {res.tUp !== null && (
              <circle cx={faultX} cy={toY(res.tUp)} r="5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
            )}
          </svg>
        </div>

        {/* Relay Tuning & Arc-Flash Readout */}
        <div className="lg:col-span-5 space-y-3">
          {/* Downstream Settings */}
          <div className="bg-slate-900/70 border border-cyan-500/30 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-cyan-300">
              Downstream Feeder ACB ({downIrA} A Frame)
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <div className="text-slate-400">Isd: {downIsdMult}× Ir</div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={1}
                  value={downIsdMult}
                  onChange={(e) => setDownIsdMult(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div>
                <div className="text-slate-400">Delay: {downDelayS.toFixed(2)}s</div>
                <input
                  type="range"
                  min={0.05}
                  max={0.3}
                  step={0.05}
                  value={downDelayS}
                  onChange={(e) => setDownDelayS(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div>
                <div className="text-slate-400">Ii: {downIiMult}× Ir</div>
                <input
                  type="range"
                  min={6}
                  max={15}
                  step={1}
                  value={downIiMult}
                  onChange={(e) => setDownIiMult(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Upstream Settings */}
          <div className="bg-slate-900/70 border border-amber-500/30 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-amber-300">
              Upstream Main Incomer ACB ({upIrA} A Frame)
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <div className="text-slate-400">Isd: {upIsdMult}× Ir</div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={1}
                  value={upIsdMult}
                  onChange={(e) => setUpIsdMult(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <div className="text-slate-400">Delay: {upDelayS.toFixed(2)}s</div>
                <input
                  type="range"
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  value={upDelayS}
                  onChange={(e) => setUpDelayS(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <div className="text-slate-400">Ii: {upIiMult}× Ir</div>
                <input
                  type="range"
                  min={6}
                  max={15}
                  step={1}
                  value={upIiMult}
                  onChange={(e) => setUpIiMult(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Arc-Flash Incident Energy & PPE Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                Arc-Flash Energy (450 mm)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Clear: {(res.clearingTimeS * 1000).toFixed(0)} ms
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-mono font-bold text-slate-100">
                {res.incidentEnergyCal} <span className="text-xs font-normal text-slate-400">cal/cm²</span>
              </div>
              <div className="text-xs font-mono text-slate-300">
                Boundary: <strong>{res.arcBoundaryM} m</strong>
              </div>
            </div>

            <div
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
                res.ppeRisk === 'extreme' || res.ppeRisk === 'high'
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : res.ppeRisk === 'moderate'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {res.ppeCategory}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}