# Mermaid.js Integration Service

## Overview
This service provides a complete integration layer between AuditReady Editor and Mermaid.js, enabling powerful diagram rendering with modern styling and audit-specific features.

## Quick Start
```typescript
import { MermaidService, MermaidRenderer } from './services/mermaid';

// Initialize service
const service = MermaidService.getInstance();
await service.initialize();

// Render a diagram
const renderer = new MermaidRenderer();
renderer.setContainer(document.getElementById('diagram-container'));

const mermaidText = `
  flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Fieldwork]
    C --> D[Reporting]
`;

await renderer.renderToContainer(mermaidText);
```

## Features
- ✅ Full Mermaid.js integration
- ✅ AuditReady theme support
- ✅ Backward compatibility with Fabric.js
- ✅ TypeScript support
- ✅ Export functionality (SVG, PNG, PDF)
- ✅ Syntax validation
- ✅ Performance optimization
- ✅ Theme management
- ✅ Advanced parsing utilities

## Architecture

### Core Components

#### MermaidService
Singleton service that manages Mermaid.js initialization and configuration.

```typescript
const service = MermaidService.getInstance();
await service.initialize();

// Render a diagram
const result = await service.renderDiagram(mermaidText, 'diagram-id');
```

#### MermaidRenderer
Handles rendering diagrams to DOM containers with custom styling.

```typescript
const renderer = new MermaidRenderer();
renderer.setContainer(containerElement);
const metadata = await renderer.renderToContainer(mermaidText);
```

#### MermaidThemeManager
Manages themes and styling for different diagram types and use cases.

```typescript
const themeManager = MermaidThemeManager.getInstance();
themeManager.setCurrentTheme('auditready-dark');
const cssVars = themeManager.generateCSSVariables();
```

#### MermaidParser
Parses Mermaid text and extracts diagram structure.

```typescript
const parsed = MermaidParser.parseDiagram(mermaidText);
console.log(parsed.nodes, parsed.edges);
```

#### MermaidExporter
Handles exporting diagrams in various formats.

```typescript
const exporter = MermaidExporter.getInstance();
const pngBlob = await exporter.exportAsPNG(svgContent, { scale: 2 });
```

#### MermaidFabricBridge
Provides backward compatibility with existing Fabric.js code.

```typescript
const bridge = new MermaidFabricBridge();
const mermaidText = bridge.convertFabricToMermaid(fabricTemplate);
```

## Supported Diagram Types
- **Flowcharts** - Process flows and decision trees
- **Sequence Diagrams** - Interaction sequences
- **Gantt Charts** - Project timelines
- **Class Diagrams** - Object-oriented structures
- **State Diagrams** - State machines
- **Entity Relationship Diagrams** - Database schemas
- **User Journey Maps** - User experience flows
- **Pie Charts** - Data visualization
- **Requirement Diagrams** - Requirements traceability
- **Git Graphs** - Version control flows
- **Mind Maps** - Hierarchical information
- **Timelines** - Chronological events
- **Quadrant Charts** - 2x2 matrices
- **Sankey Diagrams** - Flow visualization

## Themes

### Available Themes
- **auditready-dark** - Professional dark theme with blue gradients
- **auditready-light** - Clean light theme for presentations
- **auditready-contrast** - High contrast for accessibility
- **auditready-risk** - Color-coded for risk assessment
- **auditready-compliance** - Professional compliance theme

### Custom Themes
```typescript
const customTheme = {
  name: 'My Custom Theme',
  description: 'Custom theme for specific use case',
  variables: {
    primaryColor: '#your-color',
    primaryTextColor: '#text-color',
    // ... other variables
  }
};

themeManager.addCustomTheme('my-theme', customTheme);
```

## Configuration
The service comes pre-configured with AuditReady-optimized settings:

```typescript
service.updateConfig({
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#f8fafc'
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});
```

## Export Options

### SVG Export
```typescript
const svgBlob = await exporter.exportAsSVG(svgContent);
exporter.downloadBlob(svgBlob, 'diagram.svg');
```

### PNG Export
```typescript
const pngBlob = await exporter.exportAsPNG(svgContent, {
  scale: 2,
  backgroundColor: 'white'
});
```

### PDF Export
```typescript
const pdfBlob = await exporter.exportAsPDF(svgContent, {
  backgroundColor: 'white'
});
```

## Error Handling

### Validation
```typescript
const validation = service.validateSyntax(mermaidText);
if (!validation.isValid) {
  console.error('Syntax errors:', validation.errors);
}
```

### Parsing
```typescript
try {
  const parsed = MermaidParser.parseDiagram(mermaidText);
} catch (error) {
  console.error('Parse error:', error.message);
}
```

## Performance Considerations

- Diagrams are rendered asynchronously
- Large diagrams (>50 nodes) may have performance implications
- Use validation before rendering to catch errors early
- Consider using virtual rendering for very large diagrams

## Testing

Run the test suite:
```bash
npm run test:mermaid
```

Watch mode for development:
```bash
npm run dev:mermaid
```

## Migration from Fabric.js

Use the bridge for gradual migration:
```typescript
const bridge = new MermaidFabricBridge();

// Convert existing template
const mermaidText = bridge.convertFabricToMermaid(fabricTemplate);

// Render with Mermaid
await bridge.renderFabricTemplate(fabricTemplate, containerElement);
```

## Best Practices

1. **Always validate syntax** before rendering
2. **Use themes consistently** across your application
3. **Handle errors gracefully** with try-catch blocks
4. **Optimize for performance** with large diagrams
5. **Test thoroughly** with various diagram types
6. **Use TypeScript** for better development experience

## Troubleshooting

### Common Issues

**Diagram not rendering:**
- Check if container element exists
- Validate Mermaid syntax
- Ensure service is initialized

**Styling issues:**
- Verify theme configuration
- Check CSS conflicts
- Use browser dev tools to inspect SVG

**Performance problems:**
- Reduce diagram complexity
- Use appropriate themes
- Consider virtual rendering

## API Reference

See the TypeScript definitions in `types/mermaid-config.ts` for complete API documentation.

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Ensure backward compatibility
5. Test with various diagram types

## License

This service is part of the AuditReady project and follows the same licensing terms.
