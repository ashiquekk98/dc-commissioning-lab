import React, { useState } from 'react';
import {
  Server,
  Zap,
  Thermometer,
  Fuel,
  BookOpen,
  ShieldCheck,
  Activity,
  Languages,
  Printer,
  UserCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import CommissioningAcademy from './components/CommissioningAcademy';
import TopologySim from './components/TopologySim';
import PsychrometricSim from './components/PsychrometricSim';
import WetStackingSim from './components/WetStackingSim';
import ProtectionSim from './components/ProtectionSim';
import BlackBuildingSim from './components/BlackBuildingSim';

const TABS = [
  {
    id: 'academy',
    step: '01',
    label: 'L1–L5 Academy & Defects',
    shortLabel: 'Academy',
    icon: BookOpen,
    subtitle: 'Interactive Red-to-White Tag walkthrough, gate challenges & root-cause defect cases',
  },
  {
    id: 'topology',
    step: '02',
    label: 'UPS Topology (3–10 Units)',
    shortLabel: 'Topology',
    icon: Zap,
    subtitle: 'Hyperscale Distributed (N-to-N-1) vs. Block Catcher (N+1) multi-fault load simulation',
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
  {
    id: 'protection',
    step: '05',
    label: 'MV/LV Protection & Arc-Flash',
    shortLabel: 'Protection',
    icon: ShieldCheck,
    subtitle: 'Time-Current Curve (TCC) relay selectivity grading & incident energy PPE calculator',
  },
  {
    id: 'blackbuilding',
    step: '06',
    label: 'Black-Building IST Sequence',
    shortLabel: 'Black-Building',
    icon: Activity,
    subtitle: '90-second utility blackout ride-through, generator block load & 50 Hz frequency stability',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('academy');
  const [lang, setLang] = useState('EN');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleNavigateTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/90 bg-slate-900/75 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                DC Power & Commissioning Lab
              </h1>
              <p className="text-xs text-slate-400">
                Muhammed Ashique • Hyperscale MEP & IST Engineering Suite
              </p>
            </div>
          </div>

          {/* Right Action Controls: EN/IT Switch, Print PDF, Field Methodology Drawer */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={() => setLang(lang === 'EN' ? 'IT' : 'EN')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-200 transition cursor-pointer"
              title="Toggle English / Italian Site Terminology"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'EN' ? 'EN / IT' : 'IT / EN'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition cursor-pointer"
              title="Export Calculation Sheet as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Export Sheet</span>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Field Methodology</span>
            </button>
          </div>
        </div>

        {/* 6-Module Navigation Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto pb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigateTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
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
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="border-b border-slate-800/70 pb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{currentTab.label}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{currentTab.subtitle}</p>
          </div>
          {lang === 'IT' && (
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded">
              Modalità Terminologia Cantiere Milano (IT)
            </span>
          )}
        </div>

        {activeTab === 'academy' && <CommissioningAcademy onNavigateTab={handleNavigateTab} lang={lang} />}
        {activeTab === 'topology' && <TopologySim lang={lang} />}
        {activeTab === 'psychrometrics' && <PsychrometricSim lang={lang} />}
        {activeTab === 'wetstacking' && <WetStackingSim lang={lang} />}
        {activeTab === 'protection' && <ProtectionSim lang={lang} />}
        {activeTab === 'blackbuilding' && <BlackBuildingSim lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-5 px-4 sm:px-6 text-center text-xs text-slate-500">
        Built in Milan by <span className="text-slate-300 font-medium">Muhammed Ashique</span> • Hyperscale Data Center Commissioning & Critical Power Systems
      </footer>

      {/* Field Methodology & Leadership Slide-Over Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm no-print">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Muhammed Ashique</h3>
                  <p className="text-xs text-emerald-400">
                    Hyperscale Data Center Commissioning Engineer • Milan, Italy
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Specializing in end-to-end Level 1 through Level 5 Integrated Systems Testing (IST) across multi-megawatt hyperscale builds (64 MW & 16 MW campuses), bridging field electrical/mechanical execution with digital punch-list automation.
              </p>

              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Core Commissioning Pillars
                </div>
                {[
                  'L1–L5 Tag Governance (Red → White) & strict LOTO / RAMS / MOP isolation enforcement.',
                  'MV/LV Switchgear, Distributed UPS, Standby Diesel Generators, Chillers, CRAHs, DOAS & DGU systems.',
                  'BMS / EPMS / SCADA Point-to-Point (P2P) validation, 100% resistive heat-load testing & IR thermography.',
                  'Custom field inspection apps & automated VBA punch-list trackers accelerating issue closure velocity.',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 p-3 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Milan Metropolitan Area, IT</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold cursor-pointer"
              >
                Back to Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}