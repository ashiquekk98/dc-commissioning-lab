// Pure engineering calculations for Data Center Commissioning Lab v2

/**
 * Computes per-lineup load distribution for Distributed Redundant (N-to-N-1)
 * or Block Redundant (N+1 Catcher) UPS architectures with multi-fault support.
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
    // Block Redundant (N + 1 Catcher): last unit (numUnits - 1) is the Reserve Catcher
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
 * Saturation vapor pressure (kPa) via Magnus-Tetens equation
 */
export function saturationVaporPressure(tempC) {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Humidity ratio W (kg water / kg dry air) at standard sea-level pressure (101.325 kPa)
 */
export function humidityRatioFromTempRH(tempC, rhPct, pressureKPa = 101.325) {
  const pws = saturationVaporPressure(tempC);
  const pw = (rhPct / 100) * pws;
  return (0.621945 * pw) / Math.max(1, pressureKPa - pw);
}

/**
 * Computes supply & return air psychrometric states and ASHRAE Class A1 compliance
 */
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
 * Computes diesel generator wet-stacking risk & recommended load-bank burn-off duration
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