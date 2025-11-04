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

export class DesignTokenService {
  private static async callMCP(tool: string, args: any = {}) {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args })
    });
    
    if (!response.ok) {
      throw new Error('Failed to call MCP server');
    }
    
    return response.json();
  }

  static async getTokens(layer: 'settings' | 'tokens' | 'all' = 'tokens', category?: string) {
    const response = await this.callMCP('get_design_tokens', {
      layer,
      category
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
      componentName
    });
    return response.result?.content?.[0]?.text ? JSON.parse(response.result.content[0].text) : null;
  }

  static async listComponents() {
    const response = await this.callMCP('list_available_components');
    return response.result?.content?.[0]?.text ? JSON.parse(response.result.content[0].text) : [];
  }

  static async generateComponent(componentType: string, variant?: string, includeAccessibility = true) {
    const response = await this.callMCP('generate_component', {
      componentType,
      variant,
      includeAccessibility
    });
    return response.result?.content?.[0]?.text || '';
  }
}
