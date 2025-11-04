export const APP_CONFIG = {
  NAME: 'Board Manager',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
} as const;

export const VALIDATION_RULES = {
  BOARD_NAME: { MIN: 3, MAX: 100 },
  ITEM_NAME: { MIN: 1, MAX: 200 },
  DESCRIPTION: { MAX: 500 },
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  GRID_BREAKPOINTS: {
    MIN_CARD_WIDTH: '300px',
    MAX_CONTAINER_WIDTH: 'container.xl',
  },
} as const;
