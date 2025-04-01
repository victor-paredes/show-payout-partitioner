
/**
 * Standard color palette for the application
 * Used by both RecipientRow and PayoutSummary components
 */
export const COLORS = [
  // Distinct color spectrum in specified order
  "#FF4136",     // Red
  "#FF851B",     // Orange
  "#FFDC00",     // Yellow
  "#01FF70",     // Lime
  "#2ECC40",     // Green
  "#7FDBFF",     // Turquoise
  "#39CCCC",     // Cyan
  "#87CEFA",     // Sky Blue
  "#0074D9",     // Blue
  "#6610f2",     // Indigo
  "#B10DC9",     // Violet
  "#F012BE",     // Pink
  "#FF69B4",     // Hot Pink
  "#FF00FF",     // Magenta
  "#FFB347",     // Peach
  "#FF6F61",     // Coral
  "#00FF7F",     // Spring Green
  "#00FFFF",     // Aqua
  "#1E90FF",     // Dodger Blue
  "#BA55D3",     // Medium Orchid
];

// Track which color to use next
let currentColorIndex = 0;

/**
 * Resets the color index to start from the beginning
 */
export const resetColorIndex = (): void => {
  currentColorIndex = 0;
};

/**
 * Returns the next color in the palette in sequential order
 * @returns A color from the COLORS array
 */
export const getNextColor = (): string => {
  const color = COLORS[currentColorIndex % COLORS.length];
  currentColorIndex++;
  return color;
};

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
