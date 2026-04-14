export const EDITION_CLASS_RULES = [
  { key: "lettered", terms: ["lettered", "letter ed", "roman numeral"] },
  { key: "numbered", terms: ["numbered", "numbered edition", "limited numbered"] },
  { key: "traycased", terms: ["traycased", "traycase", "slipcased", "slipcase"] },
  { key: "deluxe", terms: ["deluxe", "ultra deluxe", "artist edition"] },
  { key: "gift", terms: ["gift edition"] },
  { key: "first", terms: ["first edition", "first printing", "1st edition", "1st printing"] },
  { key: "arc-proof", terms: ["arc", "proof", "galley", "uncorrected proof"] },
  { key: "paperback", terms: ["paperback", "mass market", "trade paperback"] },
  { key: "hardcover", terms: ["hardcover"] },
];

const RELATED_EDITION_MAP = {
  lettered: ["traycased", "deluxe"],
  numbered: ["traycased", "deluxe"],
  traycased: ["lettered", "numbered", "deluxe"],
  deluxe: ["traycased", "lettered", "numbered"],
  gift: ["hardcover"],
};

export function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getEditionClass(value) {
  const text = normalizeText(value);
  if (!text) return "";
  for (const group of EDITION_CLASS_RULES) {
    if (group.terms.some(term => text.includes(term))) return group.key;
  }
  return "";
}

export function isRelatedEditionClass(targetClass, candidateClass) {
  if (!targetClass || !candidateClass) return false;
  if (targetClass === candidateClass) return true;
  return (RELATED_EDITION_MAP[targetClass] || []).includes(candidateClass);
}

export function getEditionMatchType(targetEdition, candidateText) {
  const targetClass = getEditionClass(targetEdition);
  if (!targetClass) return "any";
  const candidateClass = getEditionClass(candidateText);
  if (!candidateClass) return "unknown";
  if (candidateClass === targetClass) return "strict";
  if (isRelatedEditionClass(targetClass, candidateClass)) return "related";
  return "mismatch";
}
