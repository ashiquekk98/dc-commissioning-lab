import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { calculateBlackBuildingIST } from '../utils/engineeringMath';
import InfoTip from './InfoTip';

const PRESETS = [
  { label: 'Staggered Chiller Restart (Pass)', it: 10.0, cool: 3.6, gen: 18.0, step: 50, stagger: 12 },
  { label: 'Simultaneous Chiller Inrush (Trip!)', it: 10.0, cool: 4.5, gen: 16.0, step: 45, stagger: 0 },
  { label: '24 MW Hyperscale Block IST', it: 20.0, cool: 6.0, gen: 32.0, step: 55, stagger: 15 },
];

export default function BlackBuildingSim({ lang }) {
  const [itLoadMW, setItLoadMW] = useState(10.0);
  const [coolingLoadMW, setCoolingLoadMW] = useState(3.6);
  const [genPlantMW, setGenPlantMW] = useState(18.0);
  const [maxStepPct, setMaxStepPct] = useState(50);
  const [chillerStaggerS, setChillerStaggerS] = useState(12);

  const res = calculateBlackBuildingIST({
    itLoadMW,
    coolingLoadMW,
    genPlantMW,
    maxStepPct,
    chillerStaggerS,
  });

  const applyPreset = (p) => {
    setItLoadMW(p.it);
    setCoolingLoadMW(p.cool);
    setGenPlantMW(p.gen);
    setMaxStepPct(p.step);
    setChillerStaggerS(p.stagger);
  };

  const W = 740;
  const H = 290;
  const padL = 48;
  const padR = 48;
  const padT = 22;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const toX = (t) => padL + (t / 90) * plotW;
  const toYFreq = (f) => {
    const clamped = Math.max(47.0, Math.min(50.5, f));
    return padT + plotH - ((clamped - 47.0) / 3.5) * plotH;
  };
  const maxScaleMW = Math.max(genPlantMW * 1.15, res.peakGenLoadMW * 1.1, 10);
  const toYPower = (mw) => padT + plotH - (Math.min(maxScaleMW, mw) / maxScaleMW) * plotH;

  const freqPath = res.timeline
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(pt.t).toFixed(1)} ${toYFreq(pt.freqHz).toFixed(1)}`)
    .join(' ');

  const genLoadPath = res.timeline
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(pt.t).toFixed(1)} ${toYPower(pt.genLoadMW).toFixed(1)}`)
    .join(' ');

  const tripLineY = toYFreq(48.0);

  return (
    <div className="space-y-6">
      {/* 1-Click Presets */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {lang === 'IT' ? 'Scenari IST:' : 'Presets:'}
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

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Critical IT Load</span>
            <span className="font-mono font-semibold text-cyan-300">{itLoadMW.toFixed(1)} MW</span>
          </div>
          <input
            type="range"
            min={2}
            max={24}
            step={0.5}
            value={itLoadMW}
            onChange={(e) => setItLoadMW(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Cooling Plant Load</span>
            <span className="font-mono font-semibold text-amber-300">{coolingLoadMW.toFixed(1)} MW</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={9.0}
            step={0.3}
            value={coolingLoadMW}
            onChange={(e) => setCoolingLoadMW(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Online Gen Plant</span>
            <span className="font-mono font-semibold text-emerald-300">{genPlantMW.toFixed(1)} MW</span>
          </div>
          <input
            type="range"
            min={8}
            max={36}
            step={1}
            value={genPlantMW}
            onChange={(e) => setGenPlantMW(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Gen Step Limit</span>
            <span className="font-mono font-semibold text-slate-200">{maxStepPct}%</span>
          </div>
          <input
            type="range"
            min={30}
            max={75}
            step={5}
            value={maxStepPct}
            onChange={(e) => setMaxStepPct(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center">
              Chiller Stagger
              <InfoTip
                lang={lang}
                title="Chiller Sequential Restart Stagger"
                itTerm="Avviamento Sequenziale Gruppi Frigo"
                what="A programmed BMS time delay (e.g., 10–15 seconds) between restarting each chiller and primary pump after a blackout."
                why="Electric motors draw 2–6× normal current for a few seconds at startup (inrush). Starting all chillers at once drags generator frequency below 48 Hz."
              />
            </span>
            <span className="font-mono font-semibold text-purple-300">{chillerStaggerS} s</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={2}
            value={chillerStaggerS}
            onChange={(e) => setChillerStaggerS(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>
      </div>

      {/* IST Pass / Fail Banner */}
      <div
        className={`rounded-xl border p-4 flex items-start gap-3 ${
          res.passed
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
        }`}
      >
        {res.passed ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="text-xs sm:text-sm font-bold">{res.verdictTitle}</div>
          <div className="text-xs opacity-90 mt-0.5">{res.verdictDetail}</div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center">
            Minimum Bus Frequency
            <InfoTip
              lang={lang}
              title="50 Hz Bus Frequency Dip (ANSI 81U)"
              itTerm="Buco di Frequenza / Relè 81U"
              what="When a sudden electrical load hits a generator, the engine slows down momentarily, dropping AC frequency below 50.0 Hz."
              why="If frequency drops below 48.0 Hz, ANSI 81U under-frequency protection trips the generator breaker to prevent engine stall."
            />
          </div>
          <div
            className={`text-lg font-bold font-mono mt-0.5 ${
              res.minFreqHz < 48.0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {res.minFreqHz.toFixed(2)} Hz
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Peak Gen Demand (Inrush)</div>
          <div
            className={`text-lg font-bold font-mono mt-0.5 ${
              res.peakGenLoadMW > genPlantMW ? 'text-rose-400' : 'text-amber-300'
            }`}
          >
            {res.peakGenLoadMW.toFixed(1)} MW
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Largest Step Load</div>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
            {res.maxStepObservedPct.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">UPS Ride-Through Window</div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">10.0 sec (0 ms break)</div>
        </div>
      </div>

      {/* 90-Second Waveform & Sequence Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            90-Second Black-Building IST Transient Response
            <InfoTip
              lang={lang}
              title="Black-Building Integrated Systems Test (IST)"
              itTerm="Prova in Bianco (Black-Building IST)"
              what="The final Level 5 commissioning test where utility grid power is intentionally cut at 100% simulated heat load."
              why="Proves that UPS batteries, emergency generators, switchgear controls, and cooling plants work together seamlessly with zero server downtime."
            />
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Bus Frequency (Hz)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Gen Load (MW)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-rose-500 inline-block" /> 48.0 Hz Trip Limit
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
          {[0, 5, 15, 25, 40, 55, 70, 90].map((t) => (
            <g key={t}>
              <line
                x1={toX(t)}
                y1={padT}
                x2={toX(t)}
                y2={padT + plotH}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={toX(t)}
                y={H - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono"
              >
                T+{t}s
              </text>
            </g>
          ))}

          {[47.5, 48.0, 49.0, 50.0].map((f) => (
            <g key={f}>
              <line
                x1={padL}
                y1={toYFreq(f)}
                x2={padL + plotW}
                y2={toYFreq(f)}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={toYFreq(f) + 3}
                textAnchor="end"
                className="fill-emerald-400/80 text-[10px] font-mono"
              >
                {f.toFixed(1)}Hz
              </text>
            </g>
          ))}

          {[0, Math.round(maxScaleMW * 0.5), Math.round(maxScaleMW)].map((mw) => (
            <text
              key={mw}
              x={padL + plotW + 8}
              y={toYPower(mw) + 3}
              textAnchor="start"
              className="fill-amber-400/80 text-[10px] font-mono"
            >
              {mw}MW
            </text>
          ))}

          <line
            x1={padL}
            y1={tripLineY}
            x2={padL + plotW}
            y2={tripLineY}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />

          <path d={genLoadPath} fill="none" stroke="#fbbf24" strokeWidth="2" />
          <path d={freqPath} fill="none" stroke="#34d399" strokeWidth="2.5" />

          <text x={toX(5) + 4} y={padT + 14} className="fill-rose-300 text-[10px] font-mono">
            Utility Trip
          </text>
          <text x={toX(15) + 4} y={padT + 14} className="fill-cyan-300 text-[10px] font-mono">
            Gen Sync
          </text>
          <text x={toX(25) + 4} y={padT + 28} className="fill-amber-300 text-[10px] font-mono">
            Chillers Start
          </text>
        </svg>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800">
            <span className="font-mono text-rose-400 font-bold">T+05s:</span>{' '}
            <span className="text-slate-300">MV Utility Open; UPS Batteries Hold IT Bus</span>
          </div>
          <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold">T+15s:</span>{' '}
            <span className="text-slate-300">Generators Sync & Close; UPS Walk-In</span>
          </div>
          <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800">
            <span className="font-mono text-amber-400 font-bold">T+25s:</span>{' '}
            <span className="text-slate-300">
              Staggered Cooling Restart ({chillerStaggerS}s Interval)
            </span>
          </div>
          <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold">T+60s:</span>{' '}
            <span className="text-slate-300">Island Steady-State & Thermal Audit</span>
          </div>
        </div>
      </div>
    </div>
  );
}