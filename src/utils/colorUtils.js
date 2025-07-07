/**
 * Generates a consistent color from a string input
 * @param {string} str - Input string to generate color from
 * @returns {string} Hex color code
 */
export const generateColorFromId = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate pastel colors by keeping the hue but increasing lightness
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 70%)`; // Pastel colors with 70% saturation and lightness
};

/**
 * Converts a color to a lighter version with opacity for backgrounds
 * @param {string} color - Original color
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export const getLightBackgroundColor = (color, opacity = 0.2) => {
  // If it's an HSL color, convert to RGB first
  if (color.startsWith('hsl')) {
    // Extract the hue value
    const hue = color.match(/hsl\((\d+)/)[1];
    // Create a lighter version with higher lightness
    return `hsla(${hue}, 30%, 90%, ${opacity})`;
  }
  
  // Fallback for hex colors
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
};
