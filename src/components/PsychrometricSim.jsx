import React, { useState } from 'react';
import { Thermometer, Wind, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { calculatePsychrometrics, humidityRatioFromTempRH } from '../utils/engineeringMath';
import InfoTip from './InfoTip';

const PRESETS = [
  { label: 'ASHRAE A1 Optimal (22°C / 45%)', temp: 22.0, rh: 45, deltaT: 12, mw: 4.0 },
  { label: 'High-Density Containment (25°C / 42%)', temp: 25.0, rh: 42, deltaT: 16, mw: 8.0 },
  { label: 'Winter Economizer ESD Trap (19°C / 22%)', temp: 19.0, rh: 22, deltaT: 10, mw: 3.0 },
  { label: 'Summer Dehumidification Fault (24°C / 68%)', temp: 24.0, rh: 68, deltaT: 12, mw: 4.5 },
];

export default function PsychrometricSim({ lang }) {
  const [supplyTempC, setSupplyTempC] = useState(22.0);
  const [supplyRH, setSupplyRH] = useState(45);
  const [deltaTC, setDeltaTC] = useState(12);
  const [itLoadMW, setItLoadMW] = useState(4.0);

  const data = calculatePsychrometrics({
    supplyTempC,
    supplyRH,
    deltaTC,
    itLoadMW,
  });

  const applyPreset = (p) => {
    setSupplyTempC(p.temp);
    setSupplyRH(p.rh);
    setDeltaTC(p.deltaT);
    setItLoadMW(p.mw);
  };

  const width = 560;
  const height = 310;
  const padL = 48;
  const padR = 24;
  const padT = 20;
  const padB = 38;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const tMin = 10;
  const tMax = 45;
  const wMaxG = 25;

  const toX = (t) => padL + ((t - tMin) / (tMax - tMin)) * plotW;
  const toY = (wG) => padT + plotH - (Math.min(wMaxG, Math.max(0, wG)) / wMaxG) * plotH;

  const rhLevels = [20, 40, 60, 80, 100];
  const buildRhPath = (rh) => {
    const pts = [];
    for (let t = tMin; t <= tMax; t += 1) {
      const wG = humidityRatioFromTempRH(t, rh) * 1000;
      if (wG <= wMaxG) {
        pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toX(t).toFixed(1)} ${toY(wG).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  };

  const wDpLow = humidityRatioFromTempRH(5.5, 100) * 1000;
  const wDpHigh = humidityRatioFromTempRH(15.0, 100) * 1000;
  const a1PolygonPoints = [];
  for (let t = 18; t <= 27; t += 0.5) {
    const w60 = humidityRatioFromTempRH(t, 60) * 1000;
    const wTop = Math.min(wDpHigh, w60);
    a1PolygonPoints.push(`${toX(t).toFixed(1)},${toY(wTop).toFixed(1)}`);
  }
  a1PolygonPoints.push(`${toX(27).toFixed(1)},${toY(wDpLow).toFixed(1)}`);
  a1PolygonPoints.push(`${toX(18).toFixed(1)},${toY(wDpLow).toFixed(1)}`);

  const supplyX = toX(data.supplyTempC);
  const supplyY = toY(data.wGKg);
  const returnX = toX(Math.min(tMax, data.returnTempC));
  const returnY = supplyY;

  return (
    <div className="space-y-6">
      {/* 1-Click Presets */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          {lang === 'IT' ? 'Scenari Rapidi:' : 'Presets:'}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">
              {lang === 'IT' ? 'Mandata Aria (Tdb)' : 'Supply Dry Bulb (Tdb)'}
            </span>
            <span className="font-mono font-semibold text-cyan-300">{supplyTempC.toFixed(1)} °C</span>
          </div>
          <input
            type="range"
            min={14}
            max={32}
            step={0.5}
            value={supplyTempC}
            onChange={(e) => setSupplyTempC(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">
              {lang === 'IT' ? 'Umidità Relativa (UR)' : 'Supply Rel. Humidity'}
            </span>
            <span className="font-mono font-semibold text-cyan-300">{supplyRH}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={85}
            step={1}
            value={supplyRH}
            onChange={(e) => setSupplyRH(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Server Rack ΔT</span>
            <span className="font-mono font-semibold text-amber-300">{deltaTC} K</span>
          </div>
          <input
            type="range"
            min={6}
            max={20}
            step={1}
            value={deltaTC}
            onChange={(e) => setDeltaTC(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">
              {lang === 'IT' ? 'Carico Termico Sala' : 'Data Hall IT Load'}
            </span>
            <span className="font-mono font-semibold text-emerald-300">{itLoadMW.toFixed(1)} MW</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={12.0}
            step={0.5}
            value={itLoadMW}
            onChange={(e) => setItLoadMW(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-xl border px-4 py-3 flex items-center justify-between text-xs font-medium ${
          data.isInA1Recommended
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {data.isInA1Recommended ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{data.statusReason}</span>
        </div>
        <span className="font-mono hidden sm:flex items-center">
          ASHRAE TC 9.9 Class A1
          <InfoTip
            lang={lang}
            title="ASHRAE TC 9.9 Class A1 Envelope"
            itTerm="Inviluppo Termoigrometrico ASHRAE A1"
            what="The global thermal standard for enterprise data halls: 18–27°C dry-bulb supply temperature, 5.5–15°C dew point, and ≤ 60% relative humidity."
            why="Proving the hall holds inside this green polygon during Level 4 heat-load testing is mandatory before client IT server installation."
          />
        </span>
      </div>

      {/* Chart + Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Psychrometric Process Plot (101.325 kPa)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Supply
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Return
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500/30 border border-emerald-400 inline-block" /> A1 Box
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {[15, 20, 25, 30, 35, 40].map((t) => (
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
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {t}°C
                </text>
              </g>
            ))}

            {[5, 10, 15, 20, 25].map((w) => (
              <g key={w}>
                <line
                  x1={padL}
                  y1={toY(w)}
                  x2={padL + plotW}
                  y2={toY(w)}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={toY(w) + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {w}
                </text>
              </g>
            ))}

            <text
              x={padL + plotW / 2}
              y={height - 1}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              Dry Bulb Temperature (°C)
            </text>
            <text
              x={12}
              y={padT + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90, 12, ${padT + plotH / 2})`}
              className="fill-slate-400 text-[10px]"
            >
              Humidity Ratio (g/kg)
            </text>

            {rhLevels.map((rh) => (
              <path
                key={rh}
                d={buildRhPath(rh)}
                fill="none"
                stroke={rh === 100 ? '#38bdf8' : '#334155'}
                strokeWidth={rh === 100 ? '1.5' : '1'}
                strokeDasharray={rh === 100 ? 'none' : '3 3'}
              />
            ))}

            <polygon
              points={a1PolygonPoints.join(' ')}
              fill="rgba(16, 185, 129, 0.22)"
              stroke="#10b981"
              strokeWidth="1.5"
            />

            <line
              x1={supplyX}
              y1={supplyY}
              x2={returnX}
              y2={returnY}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            <circle cx={supplyX} cy={supplyY} r="5.5" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx={returnX} cy={returnY} r="5.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3 content-start">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center">
              {lang === 'IT' ? 'Punto di Rugiada (Tdp)' : 'Dew Point (Tdp)'}
              <InfoTip
                lang={lang}
                title="Dew Point Temperature (Tdp)"
                itTerm="Punto di Rugiada"
                what="The exact temperature at which water vapor in the air condenses into liquid droplets."
                why="Below 5.5°C air becomes too dry and risks Electrostatic Discharge (ESD) sparks on server boards; above 15°C risks condensation on chilled pipes."
              />
            </div>
            <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
              {data.dewPointC.toFixed(1)} °C
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">A1 Target: 5.5 – 15.0°C</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center">
              {lang === 'IT' ? 'Bulbo Umido (Twb)' : 'Wet Bulb (Twb)'}
              <InfoTip
                lang={lang}
                title="Wet-Bulb Temperature (Twb)"
                itTerm="Temperatura di Bulbo Umido"
                what="The lowest temperature air can reach purely through water evaporation."
                why="Determines how efficiently cooling towers and adiabatic free-cooling chillers can reject heat without mechanical compressors."
              />
            </div>
            <div className="text-xl font-mono font-bold text-slate-100 mt-1">
              {data.wetBulbC.toFixed(1)} °C
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Adiabatic limit ref</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Humidity Ratio (W)</div>
            <div className="text-xl font-mono font-bold text-slate-100 mt-1">
              {data.wGKg.toFixed(2)} <span className="text-xs font-normal text-slate-400">g/kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Constant across servers</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center">
              Specific Enthalpy
              <InfoTip
                lang={lang}
                title="Specific Enthalpy (h)"
                itTerm="Entalpia Specifica"
                what="Total thermal energy (sensible heat + moisture latent heat) carried per kilogram of dry air."
                why="Used by BMS economizer logic to decide when outdoor air is cool and dry enough for direct free cooling."
              />
            </div>
            <div className="text-xl font-mono font-bold text-slate-100 mt-1">
              {data.enthalpyKJkg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kJ/kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Supply air energy</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">
              {lang === 'IT' ? 'Ripresa Aria CRAH' : 'Return Air State'}
            </div>
            <div className="text-xl font-mono font-bold text-amber-300 mt-1">
              {data.returnTempC.toFixed(1)} °C
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{data.returnRH.toFixed(1)}% RH at CRAH return</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'IT' ? 'Portata Aria' : 'Required Airflow'}
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              {data.airflowM3s.toFixed(1)} <span className="text-xs font-normal text-slate-400">m³/s</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {Math.round(data.airflowCFM).toLocaleString()} CFM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}