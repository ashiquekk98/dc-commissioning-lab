// Complete Engineering Calculation Engines for DC Power & Commissioning Lab v3

/**
 * 1. UPS Topology & Redundancy Redistribution Engine (up to 10 lineups & multi-fault N-2)
 */
export function calculateTopology({ mode, numUnits, unitRatingMW, totalLoadMW, trippedIndices = [] }) {
  const nMinus1Units = Math.max(1, numUnits - 1);
  const firmCapacityMW = Number((nMinus1Units * unitRatingMW).toFixed(2));
  const installedCapacityMW = Number((numUnits * unitRatingMW).toFixed(2));
  const firmUtilizationPct = firmCapacityMW > 0 ? (totalLoadMW / firmCapacityMW) * 100 : 0;

  const trippedSet = new Set(trippedIndices);
  const units = [];
  let maxUnitLoadPct = 0;
  let anyOverload = false;
  let unservedLoadMW = 0;

  if (mode === 'distributed') {
    const healthyCount = Math.max(0, numUnits - trippedSet.size);
    const loadPerHealthy = healthyCount > 0 ? totalLoadMW / healthyCount : 0;
    if (healthyCount === 0 && totalLoadMW > 0) {
      unservedLoadMW = totalLoadMW;
      anyOverload = true;
    }

    for (let i = 0; i < numUnits; i++) {
      const isTripped = trippedSet.has(i);
      const loadMW = isTripped ? 0 : loadPerHealthy;
      const loadPct = unitRatingMW > 0 ? (loadMW / unitRatingMW) * 100 : 0;
      const isOverloaded = !isTripped && loadMW > unitRatingMW + 0.001;

      if (loadPct > maxUnitLoadPct) maxUnitLoadPct = loadPct;
      if (isOverloaded) anyOverload = true;

      units.push({
        id: i,
        label: `UPS-${String.fromCharCode(65 + i)}`,
        role: 'Distributed Bus',
        isTripped,
        loadMW,
        loadPct,
        isOverloaded,
        stsTransferred: false,
      });
    }
  } else {
    const catcherIndex = numUnits - 1;
    const primaryCount = numUnits - 1;
    const basePrimaryLoad = primaryCount > 0 ? totalLoadMW / primaryCount : 0;

    let trippedPrimaryCount = 0;
    for (let i = 0; i < catcherIndex; i++) {
      if (trippedSet.has(i)) trippedPrimaryCount++;
    }

    const catcherHealthy = !trippedSet.has(catcherIndex);
    const catcherLoadMW = catcherHealthy && trippedPrimaryCount > 0 ? basePrimaryLoad * trippedPrimaryCount : 0;
    if (!catcherHealthy && trippedPrimaryCount > 0) {
      unservedLoadMW = basePrimaryLoad * trippedPrimaryCount;
      anyOverload = true;
    }

    for (let i = 0; i < numUnits; i++) {
      const isCatcher = i === catcherIndex;
      const isTripped = trippedSet.has(i);
      let loadMW = 0;
      let stsTransferred = false;

      if (!isTripped) {
        if (!isCatcher) {
          loadMW = basePrimaryLoad;
        } else if (trippedPrimaryCount > 0) {
          loadMW = catcherLoadMW;
          stsTransferred = true;
        }
      }

      const loadPct = unitRatingMW > 0 ? (loadMW / unitRatingMW) * 100 : 0;
      const isOverloaded = !isTripped && loadMW > unitRatingMW + 0.001;

      if (loadPct > maxUnitLoadPct) maxUnitLoadPct = loadPct;
      if (isOverloaded) anyOverload = true;

      units.push({
        id: i,
        label: isCatcher ? 'CATCHER' : `UPS-${i + 1}`,
        role: isCatcher ? 'Reserve Bus (STS)' : 'Primary Bus',
        isTripped,
        loadMW,
        loadPct,
        isOverloaded,
        stsTransferred,
      });
    }
  }

  return {
    units,
    firmCapacityMW,
    installedCapacityMW,
    firmUtilizationPct,
    maxUnitLoadPct,
    anyOverload,
    unservedLoadMW,
    trippedCount: trippedSet.size,
    redundancyLabel: mode === 'distributed' ? `${numUnits}-to-${numUnits - 1}` : `(${numUnits - 1})+1 Catcher`,
  };
}

/**
 * 2. ASHRAE Class A1 Psychrometrics & Hall Airflow Engine
 */
export function saturationVaporPressure(tempC) {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

export function humidityRatioFromTempRH(tempC, rhPct, pressureKPa = 101.325) {
  const pws = saturationVaporPressure(tempC);
  const pw = (rhPct / 100) * pws;
  return (0.621945 * pw) / Math.max(1, pressureKPa - pw);
}

export function calculatePsychrometrics({ supplyTempC, supplyRH, deltaTC, itLoadMW }) {
  const pressureKPa = 101.325;
  const pwsSupply = saturationVaporPressure(supplyTempC);
  const pwSupply = Math.max(0.01, (supplyRH / 100) * pwsSupply);

  const lnRatio = Math.log(pwSupply / 0.61078);
  const dewPointC = (237.3 * lnRatio) / (17.27 - lnRatio);

  const wKgKg = (0.621945 * pwSupply) / (pressureKPa - pwSupply);
  const wGKg = wKgKg * 1000;

  const wetBulbC =
    supplyTempC * Math.atan(0.151977 * Math.pow(supplyRH + 8.313659, 0.5)) +
    Math.atan(supplyTempC + supplyRH) -
    Math.atan(supplyRH - 1.676331) +
    0.00391838 * Math.pow(supplyRH, 1.5) * Math.atan(0.023101 * supplyRH) -
    4.686035;

  const enthalpyKJkg = 1.006 * supplyTempC + wKgKg * (2501 + 1.86 * supplyTempC);

  const returnTempC = supplyTempC + deltaTC;
  const pwsReturn = saturationVaporPressure(returnTempC);
  const returnRH = Math.min(100, (pwSupply / pwsReturn) * 100);

  const qKW = itLoadMW * 1000;
  const airflowM3s = qKW / (1.2 * 1.005 * Math.max(1, deltaTC));
  const airflowCFM = airflowM3s * 2118.88;

  const tempOk = supplyTempC >= 18 && supplyTempC <= 27;
  const dpOk = dewPointC >= 5.5 && dewPointC <= 15.0;
  const rhOk = supplyRH <= 60;
  const isInA1Recommended = tempOk && dpOk && rhOk;

  let statusReason = 'Optimal — Inside ASHRAE Class A1 Recommended Envelope';
  if (!isInA1Recommended) {
    if (dewPointC < 5.5) statusReason = 'ESD Risk — Dew point below 5.5°C minimum';
    else if (dewPointC > 15.0 || supplyRH > 60) statusReason = 'Condensation / Corrosion Risk — Moisture above A1 limit';
    else if (supplyTempC < 18) statusReason = 'Overcooling — Supply dry bulb below 18°C recommended band';
    else if (supplyTempC > 27) statusReason = 'Thermal Excursion — Supply dry bulb above 27°C recommended band';
  }

  return {
    supplyTempC,
    supplyRH,
    dewPointC,
    wetBulbC,
    wGKg,
    enthalpyKJkg,
    returnTempC,
    returnRH,
    airflowM3s,
    airflowCFM,
    isInA1Recommended,
    statusReason,
  };
}

/**
 * 3. Diesel Generator Wet-Stacking & Load-Bank Burn-Off Engine
 */
export function calculateWetStacking({ ratingKVA, powerFactor, actualLoadKW, runHours }) {
  const ratedKW = ratingKVA * powerFactor;
  const loadPct = ratedKW > 0 ? (actualLoadKW / ratedKW) * 100 : 0;
  const minSafeKW = ratedKW * 0.3;
  const recommendedLoadBankKW = ratedKW * 0.75;

  let riskLevel = 'low';
  let riskTitle = 'Healthy Combustion Zone (≥ 50% Load)';
  let recommendation =
    'Exhaust gas temperatures are sufficient to vaporize unburned fuel and prevent carbon glazing.';
  let burnOffHours = 0;

  if (loadPct < 30) {
    riskLevel = 'high';
    riskTitle = 'High Wet-Stacking Risk (< 30% Load)';
    recommendation =
      'Unburned diesel and soot accumulate in exhaust manifolds and turbochargers. Connect resistive load bank at ≥75% rated kW.';
    burnOffHours = Math.min(4, Math.max(1, Number((runHours * 0.25).toFixed(1))));
  } else if (loadPct < 50) {
    riskLevel = 'moderate';
    riskTitle = 'Moderate / Light-Load Operation (30% – 49%)';
    recommendation =
      'Acceptable for short commissioning windows, but prolonged light-load running requires scheduled load-bank exercise.';
    burnOffHours = Math.min(2, Math.max(0.5, Number((runHours * 0.1).toFixed(1))));
  }

  return {
    ratedKW,
    loadPct,
    minSafeKW,
    recommendedLoadBankKW,
    riskLevel,
    riskTitle,
    recommendation,
    burnOffHours,
  };
}

/**
 * 4. MV/LV Protection Selectivity (LSI) & Arc-Flash Incident Energy Engine
 */
export function computeBreakerTripTime(currentA, irA, isdMult, shortDelayS, iiMult, instTimeS = 0.02) {
  if (currentA < irA * 1.05) return null;
  if (currentA >= irA * iiMult) return instTimeS;
  if (currentA >= irA * isdMult) return shortDelayS;
  const ratio = currentA / irA;
  return Math.min(100, Math.max(shortDelayS + 0.1, 8.0 / Math.pow(ratio, 2)));
}

export function calculateProtectionCoordination({
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
}) {
  const faultA = faultCurrentKA * 1000;
  const tDown =
    faultLocation === 'downstream'
      ? computeBreakerTripTime(faultA, downIrA, downIsdMult, downDelayS, downIiMult, 0.02)
      : null;
  const tUp = computeBreakerTripTime(faultA, upIrA, upIsdMult, upDelayS, upIiMult, 0.025);

  const clearingTimeS =
    faultLocation === 'downstream'
      ? Math.min(tDown ?? 2.0, tUp ?? 2.0)
      : tUp ?? 2.0;

  const gradingMarginMs =
    tDown !== null && tUp !== null ? Math.round((tUp - tDown) * 1000) : null;

  let status = 'coordinated';
  let statusTitle = 'Selectively Coordinated — Downstream Isolates Fault';
  let statusDetail =
    'Downstream feeder breaker trips cleanly before upstream main breaker, keeping healthy critical buses online.';

  if (faultLocation === 'main') {
    status = 'main-fault';
    statusTitle = 'Main Busbar Fault — Upstream Incomer Clearing';
    statusDetail =
      'Fault occurs upstream of feeder breakers; main incomer relay clears the bus within its programmed time dial.';
  } else if (tDown === null) {
    status = 'no-trip';
    statusTitle = 'Fault Current Below Downstream Pickup';
    statusDetail = 'Increase fault current or lower downstream pickup settings to evaluate trip coordination.';
  } else if (tUp !== null && gradingMarginMs <= 0) {
    status = 'uncoordinated';
    statusTitle = 'Loss of Selectivity — Upstream Blackout!';
    statusDetail =
      'Upstream main breaker trips simultaneously or faster than downstream feeder (often due to overlapping Instantaneous Ii pickup).';
  } else if (tUp !== null && gradingMarginMs < 80) {
    status = 'marginal';
    statusTitle = `Marginal Selectivity (${gradingMarginMs} ms Grading Margin)`;
    statusDetail =
      'IEC/IEEE best practice requires ≥ 80–100 ms grading margin to account for breaker mechanical opening time.';
  }

  // Educational Incident Energy (cal/cm²) at 450mm working distance
  const incidentEnergyCal = Number((0.95 * faultCurrentKA * clearingTimeS).toFixed(2));
  const arcBoundaryM = Number((0.42 * Math.sqrt(Math.max(0.1, incidentEnergyCal * 2.2))).toFixed(2));

  let ppeCategory = 'PPE Cat 1 (4 cal/cm²)';
  let ppeRisk = 'low';
  if (incidentEnergyCal > 40) {
    ppeCategory = 'DANGER > 40 cal/cm² (Remote Racking Only)';
    ppeRisk = 'extreme';
  } else if (incidentEnergyCal > 25) {
    ppeCategory = 'PPE Cat 4 (40 cal/cm² Arc Suit)';
    ppeRisk = 'high';
  } else if (incidentEnergyCal > 8) {
    ppeCategory = 'PPE Cat 3 (25 cal/cm²)';
    ppeRisk = 'moderate';
  } else if (incidentEnergyCal > 4) {
    ppeCategory = 'PPE Cat 2 (8 cal/cm²)';
    ppeRisk = 'low';
  }

  return {
    faultA,
    tDown,
    tUp,
    clearingTimeS,
    gradingMarginMs,
    status,
    statusTitle,
    statusDetail,
    incidentEnergyCal,
    arcBoundaryM,
    ppeCategory,
    ppeRisk,
  };
}

/**
 * 5. Black-Building IST Sequence & 50Hz Bus Frequency-Dip Simulator (T = 0..90s)
 */
export function calculateBlackBuildingIST({
  itLoadMW,
  coolingLoadMW,
  genPlantMW,
  maxStepPct,
  chillerStaggerS,
}) {
  const timeline = [];
  let minFreqHz = 50.0;
  let maxFreqHz = 50.0;
  let peakGenLoadMW = 0;
  let maxStepObservedPct = 0;
  let prevGenLoadMW = 0;

  const stage1Start = 25;
  const stage2Start = 25 + chillerStaggerS;
  const stage3Start = 25 + chillerStaggerS * 2;
  const stageRunningMW = coolingLoadMW / 3;

  const getStageDemand = (t, startT) => {
    if (t < startT) return 0;
    const elapsed = t - startT;
    // 3-second motor/VFD magnetizing inrush pulse (2.2x running load)
    if (elapsed < 3) return stageRunningMW * 2.2;
    return stageRunningMW;
  };

  for (let t = 0; t <= 90; t++) {
    let phase = 'Utility Normal';
    let genLoadMW = 0;
    let upsBatteryMW = 0;
    let freqHz = 50.0;

    if (t < 5) {
      phase = 'Utility Normal';
      freqHz = 50.0;
    } else if (t < 15) {
      phase = 'Blackout — UPS Battery Ride-Through';
      upsBatteryMW = itLoadMW;
      freqHz = 50.0; // UPS inverter maintains rock-solid 50.00 Hz on critical bus
    } else if (t < 20) {
      phase = 'Generators Synced — UPS Rectifier Walk-In';
      const walkInRatio = (t - 14) / 5;
      genLoadMW = itLoadMW * walkInRatio;
      upsBatteryMW = Math.max(0, itLoadMW - genLoadMW);
    } else {
      phase = t < stage3Start + 6 ? 'Staggered Cooling Plant Restart' : 'Steady-State Island Mode';
      const c1 = getStageDemand(t, stage1Start);
      const c2 = getStageDemand(t, stage2Start);
      const c3 = getStageDemand(t, stage3Start);
      genLoadMW = itLoadMW + c1 + c2 + c3;
    }

    if (t >= 15) {
      const stepDeltaMW = Math.max(0, genLoadMW - prevGenLoadMW);
      const stepPct = genPlantMW > 0 ? (stepDeltaMW / genPlantMW) * 100 : 0;
      if (stepPct > maxStepObservedPct) maxStepObservedPct = stepPct;

      const loadRatio = genPlantMW > 0 ? genLoadMW / genPlantMW : 1;
      const transientDip = (stepPct / Math.max(10, maxStepPct)) * 1.45;
      const steadyDroop = loadRatio * 0.45;
      freqHz = Number((50.0 - transientDip - steadyDroop).toFixed(2));
    }

    prevGenLoadMW = genLoadMW;
    if (genLoadMW > peakGenLoadMW) peakGenLoadMW = genLoadMW;
    if (freqHz < minFreqHz) minFreqHz = freqHz;
    if (freqHz > maxFreqHz) maxFreqHz = freqHz;

    timeline.push({
      t,
      phase,
      genLoadMW: Number(genLoadMW.toFixed(2)),
      upsBatteryMW: Number(upsBatteryMW.toFixed(2)),
      freqHz,
    });
  }

  const underFreqTrip = minFreqHz < 48.0; // ANSI 81U under-frequency trip threshold
  const genOverload = peakGenLoadMW > genPlantMW;
  const passed = !underFreqTrip && !genOverload;

  let verdictTitle = 'IST Black-Building Sequence Passed — Bus Frequency Stable';
  let verdictDetail = `Minimum bus frequency held at ${minFreqHz.toFixed(
    2
  )} Hz (above 48.0 Hz ANSI 81U trip limit) with smooth UPS-to-generator transition.`;

  if (genOverload) {
    verdictTitle = 'IST Failed — Generator Plant Overload During Cooling Inrush';
    verdictDetail = `Peak demand (${peakGenLoadMW.toFixed(1)} MW) exceeded online generator capacity (${genPlantMW.toFixed(
      1
    )} MW). Increase chiller stagger delay or bring an additional generator online.`;
  } else if (underFreqTrip) {
    verdictTitle = 'IST Failed — Under-Frequency Relay Trip (< 48.0 Hz)';
    verdictDetail = `Simultaneous step loading caused frequency to dip to ${minFreqHz.toFixed(
      2
    )} Hz. Increase chiller restart stagger delay (≥ 10s) to separate motor inrush peaks.`;
  }

  return {
    timeline,
    minFreqHz,
    peakGenLoadMW,
    maxStepObservedPct,
    passed,
    verdictTitle,
    verdictDetail,
  };
}