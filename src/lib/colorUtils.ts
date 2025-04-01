
/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  // Reds
  "#E11D48", // Crimson
  "#DC2626", // Fire Red
  "#EF4444", // Bright Red
  "#FB7185", // Coral
  
  // Oranges
  "#F97316", // Vivid Orange
  "#EA580C", // Dark Orange
  "#F59E0B", // Amber
  "#FACC15", // Sunny Yellow
  
  // Yellows
  "#EAB308", // Golden Yellow
  "#CA8A04", // Mustard
  "#A16207", // Gold
  "#65A30D", // Avocado
  
  // Greens
  "#22C55E", // Lime Green
  "#16A34A", // Bright Green
  "#059669", // Vivid Green
  "#10B981", // Emerald
  
  // Teals/Cyans
  "#06B6D4", // Bright Cyan
  "#0891B2", // Cyan
  "#0D9488", // Dark Teal
  "#0F766E", // Deep Teal
  
  // Blues
  "#0EA5E9", // Vivid Sky Blue
  "#0284C7", // Ocean Blue
  "#2563EB", // Royal Blue
  "#1D4ED8", // Cobalt Blue
  
  // Indigos/Purples
  "#4F46E5", // Indigo
  "#7C3AED", // Electric Purple
  "#8B5CF6", // Vivid Purple
  "#9333EA", // Rich Purple
  
  // Magentas/Pinks
  "#D946EF", // Magenta Pink
  "#DB2777", // Fuchsia
  "#EC4899", // Hot Pink
  "#BE123C", // Ruby
  
  // Browns/Earthy (for variety)
  "#78350F", // Chocolate
  "#92400E", // Coffee
  "#B45309", // Cinnamon
  "#713F12", // Deep Brown
  
  // Slate/Navy (for variety)
  "#1E3A8A", // Dark Navy
  "#1E40AF", // Navy Blue
  "#0F172A", // Navy Black
  "#4B5563", // Slate
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
