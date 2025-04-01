
/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  // Reds
  "#E11D48", // Crimson
  "#DC2626", // Fire Red
  
  // Oranges
  "#F97316", // Vivid Orange
  "#F59E0B", // Amber
  
  // Yellows
  "#EAB308", // Golden Yellow
  "#FACC15", // Sunny Yellow
  
  // Greens
  "#22C55E", // Lime Green
  "#16A34A", // Bright Green
  "#059669", // Vivid Green
  
  // Teals/Cyans
  "#06B6D4", // Bright Cyan
  "#0891B2", // Cyan
  
  // Blues
  "#0EA5E9", // Vivid Sky Blue
  "#2563EB", // Royal Blue
  
  // Indigos/Purples
  "#4F46E5", // Indigo
  "#7C3AED", // Electric Purple
  
  // Magentas/Pinks
  "#D946EF", // Magenta Pink
  "#EC4899", // Hot Pink
  
  // Browns/Earthy
  "#78350F", // Chocolate
  "#B45309", // Cinnamon
  
  // Slate/Navy
  "#1E3A8A", // Dark Navy
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
