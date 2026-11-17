// Multi-Criteria Urgency Engine
// Domain: ClimateSphere AI | Track: Climate Shield
//
// Urgency Formula:
// Urgency = (0.35 * Normalized_Water_Rise) + 
//           (0.25 * Vulnerable_Ratio) + 
//           (0.25 * Food_Depletion_Factor) + 
//           (0.15 * Medical_Emergency_Flag)
//
// Urgency Badges:
// - High: > 70 (Red)
// - Medium: 40 - 70 (Amber)
// - Low: < 40 (Emerald)

export const MAX_REFERENCE_WATER_RISE_CMH = 20.0;
export const BASELINE_FOOD_HOURS = 24.0;

export function calculateVillageUrgency(village, options = {}) {
  const waterRiseMultiplier = options.surgeMultiplier || 1.0;
  const effectiveWaterRise = village.waterRiseCmH * waterRiseMultiplier;

  // 1. Normalized Water Rise (0 - 100)
  const normalizedWaterRise = Math.min(100, Math.max(0, (effectiveWaterRise / MAX_REFERENCE_WATER_RISE_CMH) * 100));

  // 2. Vulnerable Ratio (0 - 100)
  const vulnerableRatio = Math.min(100, Math.max(0, village.vulnerablePct));

  // 3. Food Depletion Factor (0 - 100)
  // Fewer hours remaining = higher urgency score
  const foodDepletionFactor = Math.min(100, Math.max(0, ((BASELINE_FOOD_HOURS - village.foodLeftHrs) / BASELINE_FOOD_HOURS) * 100));

  // 4. Medical Emergency Flag (0 or 100)
  const medicalEmergencyFlag = village.medicalEmergency ? 100 : 0;

  // Component Weighted Scores
  const waterComponent = 0.35 * normalizedWaterRise;
  const vulnerableComponent = 0.25 * vulnerableRatio;
  const foodComponent = 0.25 * foodDepletionFactor;
  const medicalComponent = 0.15 * medicalEmergencyFlag;

  const totalScore = parseFloat((waterComponent + vulnerableComponent + foodComponent + medicalComponent).toFixed(1));

  let badge = 'Low';
  let badgeColor = 'emerald';
  let badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

  if (totalScore > 70) {
    badge = 'High';
    badgeColor = 'crimson';
    badgeBg = 'bg-red-500/20 text-red-400 border-red-500/40';
  } else if (totalScore >= 40) {
    badge = 'Medium';
    badgeColor = 'amber';
    badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  }

  return {
    score: totalScore,
    badge,
    badgeColor,
    badgeBg,
    components: {
      water: {
        raw: effectiveWaterRise,
        normalized: parseFloat(normalizedWaterRise.toFixed(1)),
        weighted: parseFloat(waterComponent.toFixed(1)),
        weight: 0.35
      },
      vulnerable: {
        raw: village.vulnerablePct,
        normalized: parseFloat(vulnerableRatio.toFixed(1)),
        weighted: parseFloat(vulnerableComponent.toFixed(1)),
        weight: 0.25
      },
      food: {
        raw: village.foodLeftHrs,
        normalized: parseFloat(foodDepletionFactor.toFixed(1)),
        weighted: parseFloat(foodComponent.toFixed(1)),
        weight: 0.25
      },
      medical: {
        raw: village.medicalEmergency,
        normalized: medicalEmergencyFlag,
        weighted: parseFloat(medicalComponent.toFixed(1)),
        weight: 0.15
      }
    }
  };
}

export function rankVillagesByUrgency(villages, surgeMultiplier = 1.0) {
  return villages
    .map((v) => ({
      ...v,
      urgency: calculateVillageUrgency(v, { surgeMultiplier })
    }))
    .sort((a, b) => b.urgency.score - a.urgency.score);
}
