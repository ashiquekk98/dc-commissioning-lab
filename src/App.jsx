import React, { useState } from 'react';
import { Server, Zap, Thermometer, Fuel, Activity, BookOpen } from 'lucide-react';
import CommissioningAcademy from './components/CommissioningAcademy';
import TopologySim from './components/TopologySim';
import PsychrometricSim from './components/PsychrometricSim';
import WetStackingSim from './components/WetStackingSim';

const TABS = [
  {
    id: 'academy',
    step: '01',
    label: 'L1–L5 Commissioning Academy',
    shortLabel: 'Learn L1–L5',
    icon: BookOpen,
    subtitle: 'Interactive Red-to-White Tag walkthrough, field procedures & gate decision checks',
  },
  {
    id: 'topology',
    step: '02',
    label: 'UPS Topology & Redundancy',
    shortLabel: 'Topology',
    icon: Zap,
    subtitle: 'Hyperscale 3-to-2 up to 10-to-9 Distributed vs. Block Catcher fault simulation',
  },
  {
    id: 'psychrometrics',
    step: '03',
    label: 'ASHRAE A1 Psychrometrics',
    shortLabel: 'Psychrometrics',
    icon: Thermometer,
    subtitle: 'Supply/return air envelope validation, dew point, enthalpy & hall airflow sizing',
  },
  {
    id: 'wetstacking',
    step: '04',
    label: 'Generator Wet-Stacking',
    shortLabel: 'Wet-Stacking',
    icon: Fuel,
    subtitle: 'Standby diesel minimum-load threshold analysis & resistive load-bank burn-off calculator',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('academy');
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleNavigateTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/90 bg-slate-900/75 backdrop-blur-md sticky top-0 z-20">
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
                Muhammed Ashique • Hyperscale MEP & IST Interactive Learning Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-mono">L1–L5 IST Guided Suite</span>
          </div>
        </div>

        {/* Guided Step Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto pb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigateTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.step}
                </span>
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

        {activeTab === 'academy' && <CommissioningAcademy onNavigateTab={handleNavigateTab} />}
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