import React from 'react';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { addTextToCanvas, AUDIT_COLORS } from '../../core/fabric-utils';
import { Type, Plus } from 'lucide-react';

interface TextPreset {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  fill: string;
}

const textPresets: TextPreset[] = [
  {
    text: 'Add a heading',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    fill: AUDIT_COLORS.primary
  },
  {
    text: 'Add a subheading',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter',
    fill: AUDIT_COLORS.primary
  },
  {
    text: 'Add body text',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    fill: '#333333'
  },
  {
    text: 'Add a caption',
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    fill: '#666666'
  }
];

const auditTextPresets: TextPreset[] = [
  {
    text: 'AUDIT FINDING',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    fill: AUDIT_COLORS.danger
  },
  {
    text: 'COMPLIANCE CHECK',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    fill: AUDIT_COLORS.secondary
  },
  {
    text: 'RISK ASSESSMENT',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    fill: AUDIT_COLORS.warning
  },
  {
    text: 'PROCESS STEP',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    fill: AUDIT_COLORS.primary
  }
];

const TextPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();

  const handleAddCustomText = async () => {
    if (!canvas) {
      console.log('Canvas not available');
      return;
    }

    console.log('Adding custom text');
    const textObj = await addTextToCanvas(canvas, 'Click to edit text', {
      fontSize: 18,
      fontFamily: 'Inter',
      fill: AUDIT_COLORS.primary
    });
    
    if (textObj) {
      console.log('Text added successfully');
    } else {
      console.log('Failed to add text');
    }
  };

  const handleAddPresetText = async (preset: TextPreset) => {
    if (!canvas) {
      console.log('Canvas not available');
      return;
    }

    console.log('Adding preset text:', preset.text);
    const textObj = await addTextToCanvas(canvas, preset.text, {
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontFamily: preset.fontFamily,
      fill: preset.fill
    });
    
    if (textObj) {
      console.log('Preset text added successfully');
    } else {
      console.log('Failed to add preset text');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Add Custom Text Button */}
      <div>
        <button
          onClick={handleAddCustomText}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg"
          style={{ backgroundColor: AUDIT_COLORS.primary }}
        >
          <Type className="w-5 h-5" />
          Add a text box
        </button>
      </div>

      {/* Default Text Styles */}
      <div>
        <h4 className="font-semibold text-lg mb-2" style={{ color: AUDIT_COLORS.primary }}>
          Default Text Styles
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Click any style to add it to your canvas
        </p>
        
        <div className="space-y-3">
          {textPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleAddPresetText(preset)}
              className="w-full text-left p-3 border rounded-lg hover:shadow-md transition-all"
              style={{
                borderColor: AUDIT_COLORS.border,
                backgroundColor: 'white'
              }}
            >
              <div
                style={{
                  fontSize: `${Math.min(preset.fontSize / 1.5, 20)}px`,
                  fontWeight: preset.fontWeight,
                  fontFamily: preset.fontFamily,
                  color: preset.fill
                }}
              >
                {preset.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audit Text Styles */}
      <div>
        <h4 className="font-semibold text-lg mb-2" style={{ color: AUDIT_COLORS.secondary }}>
          Audit Text Styles
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Pre-formatted text for audit documentation
        </p>
        
        <div className="space-y-3">
          {auditTextPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleAddPresetText(preset)}
              className="w-full text-left p-3 border-2 rounded-lg hover:shadow-md transition-all"
              style={{
                borderColor: AUDIT_COLORS.secondary,
                backgroundColor: `${AUDIT_COLORS.secondary}05`
              }}
            >
              <div
                style={{
                  fontSize: `${Math.min(preset.fontSize / 1.5, 18)}px`,
                  fontWeight: preset.fontWeight,
                  fontFamily: preset.fontFamily,
                  color: preset.fill
                }}
              >
                {preset.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Options */}
      <div>
        <h4 className="font-semibold text-lg mb-2" style={{ color: AUDIT_COLORS.neutral }}>
          Quick Actions
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAddPresetText({
              text: 'Title',
              fontSize: 36,
              fontWeight: 'bold',
              fontFamily: 'Inter',
              fill: AUDIT_COLORS.primary
            })}
            className="flex items-center justify-center p-3 border rounded-lg hover:shadow-md transition-all"
            style={{ borderColor: AUDIT_COLORS.border }}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Title</span>
          </button>
          
          <button
            onClick={() => handleAddPresetText({
              text: 'Note',
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'Inter',
              fill: '#666666'
            })}
            className="flex items-center justify-center p-3 border rounded-lg hover:shadow-md transition-all"
            style={{ borderColor: AUDIT_COLORS.border }}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Note</span>
          </button>
        </div>
      </div>

      <div 
        className="p-3 rounded-lg text-sm"
        style={{ backgroundColor: `${AUDIT_COLORS.primary}10` }}
      >
        <p className="text-gray-600">
          <strong>Tip:</strong> Double-click any text on the canvas to edit it directly. 
          Use the Properties panel to change fonts, colors, and formatting.
        </p>
      </div>
    </div>
  );
};

export default TextPanel; 