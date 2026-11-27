import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Award,
  AlertTriangle,
  Info,
  Wrench,
  Printer,
  RotateCcw,
} from 'lucide-react';

const LEVELS = [
  {
    id: 'L1',
    level: 'Level 1',
    tagName: 'RED TAG',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    dotColor: 'bg-rose-500',
    title: 'Factory Witness Testing (FWT) & Site Delivery',
    owner: 'OEM Vendor & Commissioning Authority (CxA)',
    duration: 'Weeks 1–4 (Pre-Install)',
    summary:
      'Verify switchgear, UPS modules, chillers, and generators meet design specs at the factory before shipping to site, followed by shock-watch and rigging inspection upon arrival.',
    subjects: [
      {
        id: 'fwt-protocol',
        title: 'Factory Witness Testing (FWT) & Type Test Verification',
        whatHappens:
          'Engineers witness full-load heat runs, dielectric withstand (Hi-Pot) tests, and protection relay injection on MV/LV switchboards and UPS units at the OEM plant.',
        deliverables: 'Signed FWT Protocol, Certified Routine Test Reports, As-Built Factory Schematics',
        fieldTrap:
          'Accepting "similar frame" type-test certificates without verifying project-specific CT/PT ratios and arc-flash clearing times.',
      },
      {
        id: 'receiving-inspection',
        title: 'Site Receiving, Shock-Watch & Preservation',
        whatHappens:
          'Inspecting tilt/shock indicators on transformers and UPS cabinets, verifying nitrogen-charged chiller vessels, and sealing equipment against construction dust.',
        deliverables: 'Red Tag Issue Form, Receiving Checklist, Storage Humidity/Heater Log',
        fieldTrap:
          'Leaving MV switchgear space heaters unpowered during damp winter storage, causing condensation on busbar insulation.',
      },
    ],
    challenge: {
      question:
        'During L1 receiving inspection of a 2.5 MVA cast-resin transformer, you notice the impact indicator is triggered (red) and a shipping-split busbar joint has no torque witness marks. What is your call?',
      options: [
        {
          text: 'Install it anyway and check it later during Level 3 energization.',
          correct: false,
          feedback: 'Never energize mechanically shocked MV equipment—internal core/winding shifts can cause catastrophic flashover.',
        },
        {
          text: 'Hold Red Tag sign-off, log a formal punch item, and mandate OEM winding resistance + turns-ratio (TTR) & torque verification.',
          correct: true,
          feedback: 'Spot on. Locking the Red Tag forces OEM testing before rigging onto permanent pads.',
        },
        {
          text: 'Paint over the witness marks after tightening the bolts by hand.',
          correct: false,
          feedback: 'Torque values must follow OEM calibrated torque wrench specs and be witnessed.',
        },
      ],
    },
    simLink: {
      tab: 'topology',
      label: 'Explore UPS Lineup Sizing in Topology Lab',
    },
  },
  {
    id: 'L2',
    level: 'Level 2',
    tagName: 'YELLOW TAG',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    dotColor: 'bg-amber-400',
    title: 'Installation Verification & Pre-Energization',
    owner: 'General Contractor (GC) & MEP Subcontractors',
    duration: 'Weeks 5–10 (Static Checks)',
    summary:
      'Static mechanical and electrical readiness checks: torque verification, Megger insulation resistance, phase rotation, hydro-testing, and LOTO boundary establishment.',
    subjects: [
      {
        id: 'loto-arcflash',
        title: 'LOTO Boundaries & Protection Coordination Audit',
        whatHappens:
          'Establishing multi-lock Lockout/Tagout isolation points and auditing breaker trip settings (LSI/G) against the approved Arc Flash & Selectivity Study.',
        deliverables: 'LOTO Isolation Matrix, Arc-Flash Labels, Relay Setting Validation Sheet',
        fieldTrap:
          'Upstream MV/LV breaker naming mismatches or unprogrammed instantaneous pickup settings causing nuisance blackouts during startup.',
      },
      {
        id: 'megger-torque',
        title: 'Megger Insulation Resistance & Busbar Thermography Prep',
        whatHappens:
          'Performing 1 kV / 5 kV insulation resistance (IR) testing on all feeders, verifying phase sequence (L1-L2-L3), and recording calibrated torque marks.',
        deliverables: 'Yellow Tag Checklist, Megger Test Logs, Flushing & Pressure Test Certificates',
        fieldTrap:
          'Megger-testing feeders while sensitive UPS control boards or surge arrestors are still connected, destroying electronic cards.',
      },
    ],
    challenge: {
      question:
        'Before Yellow Tag sign-off on a critical distribution board, your SLD audit reveals the upstream breaker ID and trip curve do not match the latest Arc Flash study. What do you do?',
      options: [
        {
          text: 'Issue a Conditional Yellow Tag and energize at low load.',
          correct: false,
          feedback: 'Fault current does not depend on load current—incorrect protection coordination is an immediate life-safety hazard.',
        },
        {
          text: 'Freeze Yellow Tag approval, issue a technical query to the electrical designer, and verify relay programming before LOTO release.',
          correct: true,
          feedback: 'Correct. Protection selectivity and accurate SLD labeling are hard pre-energization safety gates.',
        },
        {
          text: 'Manually adjust the dial to maximum so it never trips.',
          correct: false,
          feedback: 'Maximizing trip thresholds defeats arc-flash energy limits and upstream selectivity.',
        },
      ],
    },
    simLink: {
      tab: 'protection',
      label: 'Test Relay Selectivity & Arc-Flash in Protection Lab',
    },
  },
  {
    id: 'L3',
    level: 'Level 3',
    tagName: 'GREEN TAG',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    dotColor: 'bg-emerald-500',
    title: 'Startup, First Energization & BMS/EPMS P2P',
    owner: 'OEM Field Service Engineers (Vertiv, Schneider, CAT, Siemens)',
    duration: 'Weeks 11–14 (Dynamic Startup)',
    summary:
      'Controlled first energization under strict RAMS/MOP procedures, battery string impedance testing, TAB air/water balancing, and 100% BMS/SCADA Point-to-Point verification.',
    subjects: [
      {
        id: 'first-energization',
        title: 'Controlled First Energization & Battery Impedance',
        whatHappens:
          'OEM engineers step-energize transformers, UPS rectifiers/inverters, and chiller VFDs while recording baseline cell ohmic/impedance values on VRLA or Li-ion strings.',
        deliverables: 'Approved Energization MOP, OEM Startup Report, Battery Baseline Log',
        fieldTrap:
          'Energizing large dry-type transformers simultaneously without accounting for magnetizing inrush current.',
      },
      {
        id: 'bms-p2p-tab',
        title: 'BMS/EPMS Point-to-Point (P2P) & TAB Balancing',
        whatHappens:
          'Forcing every physical sensor, damper, valve, and breaker status at the field device and verifying exact alarm text, priority, and scaling on the SCADA/BMS screen.',
        deliverables: '100% Signed P2P Matrix, Certified TAB Air/Hydronic Flow Report, Green Tag',
        fieldTrap:
          'Assuming BACnet/Modbus register mapping is accurate without physically tripping hardwired alarms.',
      },
    ],
    challenge: {
      question:
        'During L3 startup, a standby diesel generator runs at 18% load for 8 hours while powering auxiliary building panels during BMS P2P checks. What risk does this create?',
      options: [
        {
          text: 'Over-speeding the alternator.',
          correct: false,
          feedback: 'Engine RPM stays governed at 1500/1800 RPM; the issue is low cylinder combustion temperature.',
        },
        {
          text: 'Diesel wet-stacking—unburned fuel and carbon soot glazing the cylinder walls and exhaust turbocharger.',
          correct: true,
          feedback: 'Exactly right! Running below 30% load requires a resistive load-bank burn-off run at ≥75% capacity.',
        },
        {
          text: 'Battery overcharging.',
          correct: false,
          feedback: 'Alternator charging regulators manage battery voltage independently of main kW load.',
        },
      ],
    },
    simLink: {
      tab: 'wetstacking',
      label: 'Calculate Load-Bank Burn-Off in Wet-Stacking Lab',
    },
  },
  {
    id: 'L4',
    level: 'Level 4',
    tagName: 'BLUE TAG',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    dotColor: 'bg-cyan-400',
    title: 'Functional Performance Testing (FPT) & Heat Load',
    owner: 'Commissioning Authority (CxA) & MEP Vendors',
    duration: 'Weeks 15–18 (System Proof)',
    summary:
      'Testing each system across 0% → 25% → 50% → 75% → 100% load using portable load banks, proving Sequence of Operations (SOO), ASHRAE thermal stability, and IR thermography.',
    subjects: [
      {
        id: 'heat-load-ir',
        title: '100% Resistive Heat-Load Run & IR Thermography',
        whatHappens:
          'Deploying rack-mounted load banks in the white space to simulate full IT heat rejection while scanning busbars, breakers, and cable lugs with a Testo IR camera.',
        deliverables: '4-to-8 Hour Heat-Run Log, IR Thermography Report (ΔT < 10K), ASHRAE Envelope Proof',
        fieldTrap:
          'Overcooling empty data halls during partial-load tests, pushing supply air dew point below 5.5°C into electrostatic discharge (ESD) territory.',
      },
      {
        id: 'soo-failover',
        title: 'Sequence of Operations (SOO) & Component Failover',
        whatHappens:
          'Simulating lead/lag pump trips, CRAH fan failures, VFD faults, and UPS battery discharge tests to prove automatic failover without manual intervention.',
        deliverables: 'Executed L4 FPT Scripts, Trend Graphs, Blue Tag Sign-Off',
        fieldTrap:
          'Hidden manual overrides left in the BMS PLC logic that mask real automatic control loops.',
      },
    ],
    challenge: {
      question:
        'During an L4 data hall heat run, cold-aisle supply air is 20°C at 22% relative humidity. Why does your psychrometric check flag a warning?',
      options: [
        {
          text: 'The air is too warm for ASHRAE Class A1 servers.',
          correct: false,
          feedback: '20°C is well within the 18–27°C dry-bulb band.',
        },
        {
          text: 'The dew point drops below 5.5°C, violating the ASHRAE Class A1 lower moisture bound and raising ESD risk.',
          correct: true,
          feedback: 'Spot on! Dry-bulb temperature alone is not enough—dew point must stay between 5.5°C and 15.0°C.',
        },
        {
          text: 'Condensation will immediately form on server motherboards.',
          correct: false,
          feedback: 'Condensation happens at high dew points (>15°C / high RH), whereas 22% RH is overly dry.',
        },
      ],
    },
    simLink: {
      tab: 'psychrometrics',
      label: 'Test Supply Air & Dew Point in Psychrometrics Lab',
    },
  },
  {
    id: 'L5',
    level: 'Level 5',
    tagName: 'WHITE TAG',
    tagColor: 'bg-slate-200/20 text-slate-100 border-slate-300/60',
    dotColor: 'bg-white',
    title: 'Integrated Systems Testing (IST) — Black Building',
    owner: 'CxA, Client Operations (DCEO) & All Vendors',
    duration: 'Weeks 19–20 (Final Handover)',
    summary:
      'The ultimate "pull-the-plug" test: opening main utility incomers at 100% simulated IT load to verify seamless UPS ride-through, generator block loading, cooling restart, and utility re-transfer.',
    subjects: [
      {
        id: 'black-building',
        title: 'Black-Building Utility Loss & Re-Transfer Sequence',
        whatHappens:
          'Tripping utility MV breakers under full load: UPS batteries carry the critical bus instantaneously, generators start and close onto the MV/LV bus within 10–15 seconds, and chillers/CRAHs sequential-start.',
        deliverables: 'High-Speed Waveform Capture (< 4–6 ms STS), IST Master Script, White Tag Certificate',
        fieldTrap:
          'Chiller/pump inrush currents tripping standby generators when multiple cooling plants restart simultaneously instead of staggered ramp-up.',
      },
      {
        id: 'handover-dossier',
        title: 'Punch-List Zeroing & DCEO Operational Handover',
        whatHappens:
          'Closing all Severity-1/2 commissioning issues, delivering final As-Built SLDs, O&M manuals, and transitioning the facility to 24/7 Data Center Engineering Operations.',
        deliverables: 'Final IST Report, Zero-Open-Critical Punchlist, Operational Handover Sign-Off',
        fieldTrap:
          'Leaving temporary commissioning jumpers or test bypasses enabled after completing the IST blackout sequence.',
      },
    ],
    challenge: {
      question:
        'In a 5-to-4 Distributed Redundant plant (five 2.5 MW UPS lineups feeding 8.8 MW IT load), one lineup trips mid-IST. How does the remaining plant respond?',
      options: [
        {
          text: 'The remaining 4 lineups absorb the load equally at 2.20 MW each (88% load) with zero STS transfer break.',
          correct: true,
          feedback: 'Nailed it! 8.8 MW ÷ 4 healthy lineups = 2.20 MW (88% of 2.5 MW)—completely within firm N-1 capacity.',
        },
        {
          text: 'An unloaded Catcher UPS closes its STS to pick up the 1.76 MW lost load.',
          correct: false,
          feedback: 'That describes a Block Redundant (N+1 Catcher) topology, not Distributed Redundant.',
        },
        {
          text: 'The remaining 4 lineups overload above 100% and drop to static bypass.',
          correct: false,
          feedback: 'Firm N-1 capacity is 4 × 2.5 MW = 10.0 MW, so 8.8 MW is safely supported.',
        },
      ],
    },
    simLink: {
      tab: 'blackbuilding',
      label: 'Run Full Black-Building Sequence in IST Lab',
    },
  },
];

const FIELD_DEFECTS = [
  {
    id: 'defect-1',
    code: 'CASE-01 • MV/LV PROTECTION',
    title: 'Nuisance Main Breaker Trip on Downstream Feeder Fault',
    clues: [
      'Event Log: 28 kA short circuit on Feeder PDU-04 caused upstream 4000 A Main Incomer to trip simultaneously.',
      'Relay Audit: Upstream ACB Instantaneous pickup (Ii) was left at factory default 6× Ir (24 kA), overlapping the fault level.',
      'Impact: Entire 12 MW data hall bus dropped instead of isolating PDU-04.',
    ],
    rootCause:
      'Instantaneous pickup (Ii) overlap defeated time-current selectivity. Raising upstream Ii above maximum prospective fault current and setting Short-Time Delay (Isd) to ≥ 0.25s restores full selectivity.',
    simTab: 'protection',
    simCta: 'Reproduce & Fix in Protection Lab',
  },
  {
    id: 'defect-2',
    code: 'CASE-02 • HYDRONIC & DGU',
    title: 'Chilled-Water Differential Pressure (ΔP) Hunting During L4 FPT',
    clues: [
      'BMS Trend: Primary/Secondary CHW loop ΔP oscillates wildly ±45 kPa every 90 seconds at 50% load.',
      'Field Inspection: Micro-bubbles detected at high-point automatic air vents; Degassing Unit (DGU) running in manual bypass.',
      'Impact: CRAH two-way control valves hunt continuously, destabilizing supply air temperature.',
    ],
    rootCause:
      'Entrained air pockets in the upper chilled-water header caused pump cavitation and erratic ΔP transmitter readings. Placing the DGU into continuous vacuum degassing mode and venting high points stabilized ΔP within ±2 kPa.',
    simTab: 'psychrometrics',
    simCta: 'Check CRAH Supply Stability in Psychrometrics Lab',
  },
  {
    id: 'defect-3',
    code: 'CASE-03 • BLACK-BUILDING IST',
    title: 'Under-Frequency Trip (47.6 Hz) at T+25s During Blackout Test',
    clues: [
      'Waveform Capture: Generators started and picked up 10 MW IT load smoothly at T+16s (49.7 Hz).',
      'Failure Point: At T+25s, all three 1.5 MW chillers restarted simultaneously, creating a 9.9 MW magnetizing/LRA inrush spike.',
      'Impact: Bus frequency dipped to 47.6 Hz, triggering ANSI 81U under-frequency lockout.',
    ],
    rootCause:
      'Zero stagger delay between chiller restart sequences exceeded the generator plant transient step-load limit. Programming a 12-second stagger between chiller stages keeps frequency above 48.9 Hz.',
    simTab: 'blackbuilding',
    simCta: 'Test 12s Chiller Stagger in Black-Building Lab',
  },
];

export default function CommissioningAcademy({ onNavigateTab, lang }) {
  const [selectedLevelId, setSelectedLevelId] = useState('L1');
  const [expandedSubjectId, setExpandedSubjectId] = useState('fwt-protocol');
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('dc_lab_academy_answers_v3');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [openDefectId, setOpenDefectId] = useState('defect-1');

  useEffect(() => {
    try {
      localStorage.setItem('dc_lab_academy_answers_v3', JSON.stringify(answers));
    } catch {
      // Ignore storage quota errors
    }
  }, [answers]);

  const activeLevel = LEVELS.find((l) => l.id === selectedLevelId) || LEVELS[0];
  const selectedAnswerIdx = answers[activeLevel.id];
  const completedCount = Object.entries(answers).filter(([lvlId, optIdx]) => {
    const lvl = LEVELS.find((l) => l.id === lvlId);
    return lvl && lvl.challenge.options[optIdx]?.correct;
  }).length;

  const handleSelectLevel = (lvl) => {
    setSelectedLevelId(lvl.id);
    setExpandedSubjectId(lvl.subjects[0]?.id || null);
  };

  const resetProgress = () => {
    setAnswers({});
    localStorage.removeItem('dc_lab_academy_answers_v3');
  };

  return (
    <div className="space-y-6">
      {/* Intro & Persistent Mastery Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {lang === 'IT'
                ? 'Percorso Interattivo Commissioning (Dal Cantiere alla Messa in Servizio)'
                : 'Interactive Commissioning Walkthrough'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            {lang === 'IT'
              ? 'Come un Data Center Hyperscale Passa dal Cemento alla Piena Potenza'
              : 'How a Hyperscale Data Center Goes From Bare Concrete to Live Power'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any commissioning gate below (Level 1 to Level 5), inspect field deliverables and real-world traps, and solve each stage’s engineering check. Your progress saves automatically.
          </p>
        </div>

        {/* Mastery Meter + Print / Reset */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 shrink-0 min-w-[230px] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'IT' ? 'Gate Superati' : 'Gates Mastered'}
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {completedCount} / {LEVELS.length}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(completedCount / LEVELS.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1 no-print">
            <button
              onClick={() => window.print()}
              className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3 h-3" /> Print / PDF Summary
            </button>
            {completedCount > 0 && (
              <button
                onClick={resetProgress}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive 5-Stage Tag Pipeline Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {LEVELS.map((lvl) => {
          const isSelected = lvl.id === activeLevel.id;
          const isSolved =
            answers[lvl.id] !== undefined && lvl.challenge.options[answers[lvl.id]]?.correct;

          return (
            <button
              key={lvl.id}
              onClick={() => handleSelectLevel(lvl)}
              className={`text-left rounded-xl border p-3.5 transition cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${lvl.tagColor}`}
                >
                  {lvl.tagName}
                </span>
                {isSolved && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <div className="text-xs font-bold text-slate-100">{lvl.level}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                {lvl.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep-Dive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeLevel.dotColor}`} />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {activeLevel.level} • {activeLevel.duration}
                </span>
              </div>
              <span className="text-[11px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
                Owner: <strong className="text-slate-100">{activeLevel.owner}</strong>
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-100">{activeLevel.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{activeLevel.summary}</p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Click a Subject to Inspect Field Procedures
            </div>

            {activeLevel.subjects.map((subj) => {
              const isOpen = expandedSubjectId === subj.id;
              return (
                <div
                  key={subj.id}
                  className={`rounded-xl border transition ${
                    isOpen
                      ? 'bg-slate-900 border-cyan-500/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedSubjectId(isOpen ? null : subj.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ClipboardCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-100">
                        {subj.title}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 text-xs">
                      <div>
                        <div className="text-[11px] font-semibold uppercase text-slate-400 mb-0.5">
                          What Happens on Site
                        </div>
                        <p className="text-slate-200 leading-relaxed">{subj.whatHappens}</p>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                        <div className="text-[11px] font-semibold uppercase text-emerald-400 mb-0.5">
                          Mandatory Gate Deliverables
                        </div>
                        <p className="text-slate-300 font-mono text-[11px]">{subj.deliverables}</p>
                      </div>

                      <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-semibold uppercase text-amber-300 mb-0.5">
                            Real-World Commissioning Trap
                          </div>
                          <p className="text-slate-300 leading-relaxed">{subj.fieldTrap}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Gate Challenge + Simulator Bridge */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {activeLevel.level} Gate Decision Check
              </span>
              <span className="text-[11px] font-mono text-slate-400">{activeLevel.tagName}</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {activeLevel.challenge.question}
            </p>

            <div className="space-y-2">
              {activeLevel.challenge.options.map((opt, idx) => {
                const isChosen = selectedAnswerIdx === idx;
                let btnStyle =
                  'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                if (isChosen) {
                  btnStyle = opt.correct
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500 text-rose-200';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [activeLevel.id]: idx })}
                    className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition cursor-pointer ${btnStyle}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {selectedAnswerIdx !== undefined && (
              <div
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  activeLevel.challenge.options[selectedAnswerIdx]?.correct
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}
              >
                {activeLevel.challenge.options[selectedAnswerIdx]?.feedback}
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 no-print">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                Test the live engineering physics behind{' '}
                <strong className="text-slate-100">{activeLevel.level}</strong>:
              </div>
            </div>
            <button
              onClick={() => onNavigateTab(activeLevel.simLink.tab)}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{activeLevel.simLink.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Spot the Field Defect — Root-Cause Troubleshooting Arena */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-100">
              {lang === 'IT'
                ? 'Arena Diagnostica: Individua il Guasto in Cantiere'
                : 'Spot the Field Defect — Root-Cause Troubleshooting Arena'}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Real Hyperscale Site Cases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FIELD_DEFECTS.map((defect) => {
            const isSelected = openDefectId === defect.id;
            return (
              <div
                key={defect.id}
                onClick={() => setOpenDefectId(defect.id)}
                className={`rounded-xl border p-4 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-950 border-amber-500/60'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="text-[10px] font-mono font-bold text-amber-400">{defect.code}</div>
                  <div className="text-xs font-bold text-slate-100 leading-snug">{defect.title}</div>
                  <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                    {defect.clues.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {isSelected && (
                  <div className="pt-2 border-t border-slate-800 space-y-2.5">
                    <div className="text-[11px] text-emerald-300 leading-relaxed">
                      <strong>Root Cause & Fix:</strong> {defect.rootCause}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab(defect.simTab);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer no-print"
                    >
                      <span>{defect.simCta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}