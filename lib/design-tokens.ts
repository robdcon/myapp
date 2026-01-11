export interface DesignToken {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
}

export interface ComponentGuideline {
  name: string;
  variants: string[];
  usage: string;
  accessibility: string[];
  examples: any[];
}

// Turquoise Color Palette Constants
export const TURQUOISE_COLORS = {
  emerald_depths: {
    50: '#bef0e4',
    100: '#7de2c9',
    200: '#3cd3ad',
    300: '#239c7e',
    400: '#11493b',
    500: '#155b4a', // DEFAULT
    600: '#0c372c',
    700: '#08251e',
    800: '#04120f',
    900: '#020906',
  },
  blue_spruce: {
    50: '#c4f2ed',
    100: '#89e4db',
    200: '#4ed7c9',
    300: '#29b4a6',
    400: '#166059',
    500: '#1b786e', // DEFAULT
    600: '#104843',
    700: '#0b302c',
    800: '#051816',
    900: '#030b0a',
  },
  dark_cyan: {
    50: '#c9f3f2',
    100: '#94e7e5',
    200: '#5edcd8',
    300: '#2dccc7',
    400: '#1a7875',
    500: '#219591', // DEFAULT (Primary brand color)
    600: '#145a58',
    700: '#0d3c3b',
    800: '#071e1d',
    900: '#030f0e',
  },
  tropical_teal: {
    50: '#cff4f5',
    100: '#9fe9eb',
    200: '#6fdfe0',
    300: '#3fd4d6',
    400: '#1f8f91',
    500: '#27b2b5', // DEFAULT
    600: '#176b6d',
    700: '#0f4748',
    800: '#082424',
    900: '#041212',
  },
} as const;

// Semantic color mappings
export const SEMANTIC_COLORS = {
  primary: TURQUOISE_COLORS.dark_cyan,
  secondary: TURQUOISE_COLORS.tropical_teal,
  success: TURQUOISE_COLORS.emerald_depths,
  info: TURQUOISE_COLORS.blue_spruce,
} as const;

export class DesignTokenService {
  private static async callMCP(tool: string, args: any = {}) {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
    });

    if (!response.ok) {
      throw new Error('Failed to call MCP server');
    }

    return response.json();
  }

  static async getTokens(layer: 'settings' | 'tokens' | 'all' = 'tokens', category?: string) {
    const response = await this.callMCP('get_design_tokens', {
      layer,
      category,
    });
    return response.result?.content?.[0]?.text ? JSON.parse(response.result.content[0].text) : {};
  }

  static async getColorTokens(layer: 'settings' | 'tokens' = 'tokens') {
    return this.getTokens(layer, 'colors');
  }

  static async getSpacingTokens(layer: 'settings' | 'tokens' = 'tokens') {
    return this.getTokens(layer, 'spacing');
  }

  static async getTypographyTokens(layer: 'settings' | 'tokens' = 'tokens') {
    return this.getTokens(layer, 'typography');
  }

  static async getComponentGuidelines(componentName: string) {
    const response = await this.callMCP('get_component_guidelines', {
      componentName,
    });
    return response.result?.content?.[0]?.text ? JSON.parse(response.result.content[0].text) : null;
  }

  static async listComponents() {
    const response = await this.callMCP('list_available_components');
    return response.result?.content?.[0]?.text ? JSON.parse(response.result.content[0].text) : [];
  }

  static async generateComponent(
    componentType: string,
    variant?: string,
    includeAccessibility = true
  ) {
    const response = await this.callMCP('generate_component', {
      componentType,
      variant,
      includeAccessibility,
    });
    return response.result?.content?.[0]?.text || '';
  }
}
