/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  // Vibrant Rainbow Colors
  "#FF0000", // Pure Red
  "#FF4500", // Orange Red
  "#FF7F00", // Orange
  "#FFD700", // Gold/Yellow
  "#FFFF00", // Bright Yellow
  "#9ACD32", // Yellow Green
  "#00FF00", // Pure Green
  "#32CD32", // Lime Green
  "#00FA9A", // Medium Spring Green
  "#00FFFF", // Cyan/Aqua
  "#1E90FF", // Dodger Blue
  "#0000FF", // Pure Blue
  "#4169E1", // Royal Blue
  "#8A2BE2", // Blue Violet
  "#9400D3", // Deep Violet
  "#800080", // Purple
  "#FF00FF", // Magenta
  "#FF1493", // Deep Pink
  "#DC143C", // Crimson
  "#FF4500", // Orange Red (repeated to ensure color variety)
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
