import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Turquoise Color Palette from https://coolors.co/palettes/trending/turquoise
const turquoisePalette = {
  emerald_depths: {
    50: { value: '#bef0e4' },
    100: { value: '#7de2c9' },
    200: { value: '#3cd3ad' },
    300: { value: '#239c7e' },
    400: { value: '#11493b' },
    500: { value: '#155b4a' }, // DEFAULT
    600: { value: '#0c372c' },
    700: { value: '#08251e' },
    800: { value: '#04120f' },
    900: { value: '#020906' },
  },
  blue_spruce: {
    50: { value: '#c4f2ed' },
    100: { value: '#89e4db' },
    200: { value: '#4ed7c9' },
    300: { value: '#29b4a6' },
    400: { value: '#166059' },
    500: { value: '#1b786e' }, // DEFAULT
    600: { value: '#104843' },
    700: { value: '#0b302c' },
    800: { value: '#051816' },
    900: { value: '#030b0a' },
  },
  dark_cyan: {
    50: { value: '#c9f3f2' },
    100: { value: '#94e7e5' },
    200: { value: '#5edcd8' },
    300: { value: '#2dccc7' },
    400: { value: '#1a7875' },
    500: { value: '#219591' }, // DEFAULT
    600: { value: '#145a58' },
    700: { value: '#0d3c3b' },
    800: { value: '#071e1d' },
    900: { value: '#030f0e' },
  },
  tropical_teal: {
    50: { value: '#cff4f5' },
    100: { value: '#9fe9eb' },
    200: { value: '#6fdfe0' },
    300: { value: '#3fd4d6' },
    400: { value: '#1f8f91' },
    500: { value: '#27b2b5' }, // DEFAULT
    600: { value: '#176b6d' },
    700: { value: '#0f4748' },
    800: { value: '#082424' },
    900: { value: '#041212' },
  },
};

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Custom turquoise palette
        emeraldDepths: turquoisePalette.emerald_depths,
        blueSpruce: turquoisePalette.blue_spruce,
        darkCyan: turquoisePalette.dark_cyan,
        tropicalTeal: turquoisePalette.tropical_teal,

        // Override Chakra's built-in colors with our turquoise palette
        teal: turquoisePalette.dark_cyan, // Override teal to use our dark cyan
        cyan: turquoisePalette.tropical_teal, // Override cyan to use our tropical teal
        green: turquoisePalette.emerald_depths, // Override green for success states

        // Semantic color mappings
        primary: turquoisePalette.dark_cyan,
        secondary: turquoisePalette.tropical_teal,
        success: turquoisePalette.emerald_depths,
        info: turquoisePalette.blue_spruce,

        // Brand colors for specific use cases
        brand: turquoisePalette.dark_cyan,

        // Accent colors for highlights and secondary actions
        accent: turquoisePalette.tropical_teal,

        // App-wide semantic colors for easy theming
        appPrimary: turquoisePalette.dark_cyan,
        appSecondary: turquoisePalette.tropical_teal,
        appAccent: turquoisePalette.emerald_depths,
        appMuted: turquoisePalette.blue_spruce,
      },
      fonts: {
        body: { value: 'system-ui, sans-serif' },
        heading: { value: 'system-ui, sans-serif' },
      },
      fontSizes: {
        xs: { value: '0.75rem' },
        sm: { value: '0.875rem' },
        md: { value: '1rem' },
        lg: { value: '1.125rem' },
        xl: { value: '1.25rem' },
        '2xl': { value: '1.5rem' },
        '3xl': { value: '1.875rem' },
        '4xl': { value: '2.25rem' },
      },
      spacing: {
        xs: { value: '0.5rem' },
        sm: { value: '0.75rem' },
        md: { value: '1rem' },
        lg: { value: '1.5rem' },
        xl: { value: '2rem' },
        '2xl': { value: '3rem' },
      },
      radii: {
        sm: { value: '0.125rem' },
        md: { value: '0.375rem' },
        lg: { value: '0.5rem' },
        xl: { value: '0.75rem' },
        '2xl': { value: '1rem' },
      },
      shadows: {
        sm: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
        md: { value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
        lg: {
          value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        xl: {
          value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
        turquoise: { value: '0 4px 15px 0 rgb(33 149 145 / 0.15)' },
      },
      borderWidths: {
        thin: { value: '1px' },
        medium: { value: '2px' },
        thick: { value: '3px' },
      },
    },
    slotRecipes: {
      card: {
        slots: ['root', 'header', 'body', 'footer'],
        base: {
          root: {
            bg: 'white',
            borderRadius: 'lg',
            borderWidth: '1px',
            borderColor: 'gray.200',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            _hover: {
              shadow: 'lg',
              transform: 'translateY(-2px)',
              borderColor: 'darkCyan.200',
            },
          },
          header: {
            bg: 'darkCyan.50',
            borderBottom: '1px',
            borderColor: 'darkCyan.100',
            p: '4',
          },
          body: {
            p: '4',
          },
          footer: {
            borderTop: '1px',
            borderColor: 'gray.200',
            bg: 'gray.50',
            p: '4',
          },
        },
        variants: {
          variant: {
            elevated: {
              root: {
                shadow: 'md',
                borderWidth: '0',
              },
            },
            outline: {
              root: {
                borderColor: 'darkCyan.200',
                shadow: 'sm',
              },
            },
            subtle: {
              root: {
                bg: 'darkCyan.25',
                borderColor: 'darkCyan.100',
              },
            },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
