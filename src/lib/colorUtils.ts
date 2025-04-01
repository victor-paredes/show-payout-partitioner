
/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  // Blues
  "#2563EB", // Royal Blue
  "#0EA5E9", // Vivid Sky Blue
  "#0284C7", // Ocean Blue
  "#1E40AF", // Navy Blue
  "#1D4ED8", // Cobalt Blue
  "#4338CA", // Deep Blue
  "#1E3A8A", // Dark Navy
  
  // Greens
  "#10B981", // Emerald
  "#059669", // Vivid Green
  "#16A34A", // Bright Green
  "#15803D", // Forest Green
  "#166534", // Jungle Green
  "#22C55E", // Lime Green
  "#65A30D", // Avocado
  
  // Reds/Pinks
  "#EF4444", // Bright Red
  "#E11D48", // Crimson
  "#DC2626", // Fire Red
  "#BE123C", // Ruby
  "#DB2777", // Fuchsia
  "#EC4899", // Hot Pink
  "#9D174D", // Deep Crimson
  
  // Purples
  "#8B5CF6", // Vivid Purple
  "#7C3AED", // Electric Purple
  "#9333EA", // Rich Purple
  "#7E22CE", // Royal Purple
  "#D946EF", // Magenta Pink
  "#C026D3", // Bright Purple
  "#701A75", // Plum
  "#A21CAF", // Dark Magenta
  
  // Oranges/Yellows
  "#F97316", // Vivid Orange
  "#F59E0B", // Amber
  "#EA580C", // Dark Orange
  "#D97706", // Bronze
  "#CA8A04", // Mustard
  "#FACC15", // Sunny Yellow
  "#EAB308", // Golden Yellow
  "#C2410C", // Burnt Orange
  
  // Teals/Cyans
  "#0D9488", // Dark Teal
  "#0F766E", // Deep Teal
  "#0891B2", // Cyan
  "#06B6D4", // Bright Cyan
  "#0E7490", // Blue Lagoon
  
  // Browns/Earthy
  "#B45309", // Cinnamon
  "#92400E", // Coffee
  "#A16207", // Gold
  "#78350F", // Chocolate
  "#713F12", // Deep Brown
  
  // Miscellaneous 
  "#0F172A", // Navy Black
  "#4B5563", // Slate
  "#4F46E5", // Indigo
  "#A855F7", // Orchid
  "#FB7185", // Coral
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
