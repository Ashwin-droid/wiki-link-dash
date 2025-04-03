
/**
 * Normalizes URLs for comparison, extracting the path after /wiki/
 */
export const normalizeUrl = (url: string): string => {
  if (url.includes('/wiki/')) {
    return '/wiki/' + url.split('/wiki/')[1].split('#')[0].split('?')[0];
  }
  return url.split('#')[0].split('?')[0];
};

/**
 * Generates a random game ID
 */
export const generateGameId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
