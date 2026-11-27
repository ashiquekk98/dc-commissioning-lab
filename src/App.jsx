import React, { useState } from 'react';
import { Server, Zap, Thermometer, Fuel, Activity } from 'lucide-react';
import TopologySim from './components/TopologySim';
import PsychrometricSim from './components/PsychrometricSim';
import WetStackingSim from './components/WetStackingSim';

const TABS = [
  {
    id: 'topology',
    label: 'UPS Topology & Redundancy',
    shortLabel: 'Topology',
    icon: Zap,
    subtitle: 'Distributed (N-to-N-1) vs. Block Catcher (N+1) load redistribution & fault simulation',
  },
  {
    id: 'psychrometrics',
    label: 'ASHRAE A1 Psychrometrics',
    shortLabel: 'Psychrometrics',
    icon: Thermometer,
    subtitle: 'Supply/return air envelope validation, dew point, enthalpy & hall airflow sizing',
  },
  {
    id: 'wetstacking',
    label: 'Generator Wet-Stacking',
    shortLabel: 'Wet-Stacking',
    icon: Fuel,
    subtitle: 'Standby diesel minimum-load threshold analysis & resistive load-bank burn-off calculator',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('topology');
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/90 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                DC Power & Commissioning Lab
              </h1>
              <p className="text-xs text-slate-400">
                Muhammed Ashique • Hyperscale MEP & IST Engineering Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-mono">L1–L5 IST Interactive Suite</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto pb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="border-b border-slate-800/70 pb-3">
          <h2 className="text-lg font-bold text-slate-100">{currentTab.label}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentTab.subtitle}</p>
        </div>

        {activeTab === 'topology' && <TopologySim />}
        {activeTab === 'psychrometrics' && <PsychrometricSim />}
        {activeTab === 'wetstacking' && <WetStackingSim />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-5 px-4 sm:px-6 text-center text-xs text-slate-500">
        Built in Milan by <span className="text-slate-300 font-medium">Muhammed Ashique</span> • Data Center Commissioning & Critical Power Systems
      </footer>
    </div>
  );
}