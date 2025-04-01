/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  // Distinct color spectrum
  "#E11D48",     // Crimson Red
  "#2563EB",     // Royal Blue
  "#16A34A",     // Bright Green
  "#EAB308",     // Golden Yellow
  "#F97316",     // Vivid Orange
  
  "#7C3AED",     // Electric Purple
  "#06B6D4",     // Bright Cyan
  "#DC2626",     // Fire Red
  "#059669",     // Vivid Green
  "#F59E0B",     // Amber
  
  "#D946EF",     // Magenta Pink
  "#0EA5E9",     // Vivid Sky Blue
  "#4F46E5",     // Indigo
  "#FACC15",     // Sunny Yellow
  "#EC4899",     // Hot Pink
  
  "#78350F",     // Chocolate Brown
  "#22C55E",     // Lime Green
  "#B45309",     // Cinnamon
  "#1E3A8A",     // Dark Navy
  "#0891B2",     // Cyan
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
