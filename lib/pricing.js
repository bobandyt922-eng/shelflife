import { getEditionMatchType } from "./edition-classes";

export const toPriceNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const MIN_STRICT_COMPS_FOR_HIGH = 2;

export const pickEditionScopedPoints = (points, targetEdition, { strictOnly = false } = {}) => {
  if (!targetEdition) return points;
  const strict = points.filter(p => p.matchType === "strict");
  if (strictOnly) return strict;
  const related = points.filter(p => p.matchType === "related");
  const unknown = points.filter(p => p.matchType === "unknown");
  if (strict.length >= 2) return strict;
  if (strict.length === 1) return [...strict, ...related.slice(0, 2), ...unknown.slice(0, 1)];
  if (related.length >= 2) return related;
  if (strict.length + related.length > 0) return [...strict, ...related, ...unknown.slice(0, 1)];
  return [];
};

export function buildMarketPricePoints({ communityData = [], collectionData = [], ebayData = [], targetEdition = "", strictEditionOnly = false }) {
  const rawPoints = [
    ...communityData.map(item => ({
      price: toPriceNumber(item.price),
      source: "reports",
      matchType: item.matchType || getEditionMatchType(targetEdition, item.edition),
    })),
    ...collectionData.map(item => ({
      price: toPriceNumber(item.value),
      source: "shelves",
      matchType: item.matchType || getEditionMatchType(targetEdition, item.edition),
    })),
    ...ebayData.map(item => ({
      price: toPriceNumber(item.price),
      source: item.marketSource || item.source || "market",
      matchType: item.matchType || getEditionMatchType(targetEdition, item.title),
    })),
  ].filter(point => point.price !== null);

  if (!targetEdition) return rawPoints;
  return pickEditionScopedPoints(rawPoints, targetEdition, { strictOnly: strictEditionOnly });
}

const quantile = (sorted, q) => {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
};

export function calculateMarketStats(pricePoints = []) {
  if (pricePoints.length === 0) return { hasData: false, avg: 0, low: 0, high: 0, count: 0 };

  const sorted = pricePoints.map(p => p.price).sort((a, b) => a - b);
  let filtered = sorted;
  if (sorted.length >= 4) {
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const min = q1 - iqr * 1.5;
    const max = q3 + iqr * 1.5;
    const iqrFiltered = sorted.filter(p => p >= min && p <= max);
    if (iqrFiltered.length >= 3) filtered = iqrFiltered;
  }

  const avg = Math.round(filtered.reduce((sum, p) => sum + p, 0) / filtered.length);
  return {
    hasData: true,
    avg,
    low: Math.min(...filtered),
    high: Math.max(...filtered),
    count: filtered.length,
  };
}

export function calculateConfidence(pricePoints = [], targetEdition = "", { strictEditionOnly = false } = {}) {
  if (pricePoints.length === 0) {
    return {
      label: "Low",
      color: "#777",
      detail: targetEdition ? "No edition-matched data points yet." : "No market data points yet.",
    };
  }

  const sourceCount = new Set(pricePoints.map(p => p.source)).size;
  if (!targetEdition) {
    if (pricePoints.length >= 8 && sourceCount >= 2) {
      return { label: "High", color: "#6a6", detail: "Strong sample size across multiple sources." };
    }
    if (pricePoints.length >= 4) {
      return { label: "Medium", color: "#b99a5a", detail: "Reasonable sample size, but still developing." };
    }
    return { label: "Low", color: "#c77", detail: "Limited data points; estimate may move quickly." };
  }

  const strictCount = pricePoints.filter(p => p.matchType === "strict").length;
  const relatedCount = pricePoints.filter(p => p.matchType === "related").length;

  if (strictCount >= MIN_STRICT_COMPS_FOR_HIGH && sourceCount >= 2) {
    return { label: "High", color: "#6a6", detail: `${strictCount} strict edition matches across ${sourceCount} sources.` };
  }
  if (strictCount >= 2 || (strictCount >= 1 && relatedCount >= 1)) {
    return { label: "Medium", color: "#b99a5a", detail: `${strictCount} strict + ${relatedCount} related edition matches.` };
  }
  if (strictEditionOnly) {
    return {
      label: "Low",
      color: "#c77",
      detail: strictCount > 0 ? "Strict-only mode has very few exact comps." : "Strict-only mode found no exact edition comps.",
    };
  }
  return {
    label: "Low",
    color: "#c77",
    detail: strictCount > 0 ? "Very limited strict edition data." : "Using sparse related-edition signals.",
  };
}
