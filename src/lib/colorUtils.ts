
/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#10B981", // Green
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#DB2777", // Fuchsia
  "#16A34A", // Green
  "#9333EA", // Purple
  "#D946EF", // Magenta
  "#B45309", // Brown
  "#4F46E5", // Indigo
  "#0D9488", // Dark Teal
  "#A21CAF", // Dark Magenta
  "#15803D", // Forest Green
  "#B91C1C", // Burgundy
  "#1E40AF", // Navy Blue
  "#C2410C", // Burnt Orange
  "#0284C7", // Ocean Blue
  "#4338CA", // Deep Blue
  "#A16207", // Gold
  "#BE185D", // Raspberry
  "#0F766E", // Deep Teal
  "#7E22CE", // Royal Purple
  "#1D4ED8", // Cobalt Blue
  "#065F46", // Hunter Green
  "#9D174D", // Crimson
  "#CA8A04", // Mustard
  "#0F172A", // Navy Black
  "#166534", // Jungle Green
  "#701A75", // Plum
  "#C026D3", // Bright Purple
  "#B45309", // Cinnamon
  "#0E7490", // Blue Lagoon
  "#1E3A8A", // Dark Navy
  "#65A30D", // Avocado
  "#A16207", // Bronze
  "#BE123C"  // Ruby
];

/**
 * Deterministically generates a color from a recipient ID
 * @param recipientId The unique identifier for the recipient
 * @returns A color from the COLORS array
 */
export const getRecipientColor = (recipientId: string): string => {
  const hashCode = Array.from(recipientId).reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  );
  return COLORS[hashCode % COLORS.length];
};

export const SURPLUS_COLOR = "#E5E7EB";
export const OVERDRAW_COLOR = "#EF4444";
