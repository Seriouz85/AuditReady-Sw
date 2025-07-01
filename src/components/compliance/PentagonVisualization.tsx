import React from 'react';
import { motion } from 'framer-motion';

interface PentagonVisualizationProps {
  selectedFrameworks: Record<string, boolean>;
  mappingData: any[];
}

export const PentagonVisualization: React.FC<PentagonVisualizationProps> = ({
  selectedFrameworks,
  mappingData
}) => {
  // Pentagon coordinates (centered in 1200x700 viewBox)
  const centerX = 600;
  const centerY = 350;
  const radius = 250;
  
  // Calculate pentagon points
  const pentagonPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  // Framework configurations with asymmetrical zones
  const frameworkConfigs = [
    {
      key: 'iso27001',
      name: 'ISO 27001',
      color: '#3b82f6',
      zone: {
        points: [
          { x: centerX, y: centerY - radius * 0.8 }, // Top point
          { x: centerX + radius * 0.6, y: centerY - radius * 0.3 },
          { x: centerX + radius * 0.3, y: centerY + radius * 0.2 },
          { x: centerX - radius * 0.3, y: centerY + radius * 0.2 },
          { x: centerX - radius * 0.6, y: centerY - radius * 0.3 }
        ]
      }
    },
    {
      key: 'iso27002',
      name: 'ISO 27002',
      color: '#10b981',
      zone: {
        points: [
          { x: centerX + radius * 0.7, y: centerY - radius * 0.2 },
          { x: centerX + radius * 0.8, y: centerY + radius * 0.4 },
          { x: centerX + radius * 0.2, y: centerY + radius * 0.7 },
          { x: centerX, y: centerY + radius * 0.1 },
          { x: centerX + radius * 0.2, y: centerY - radius * 0.4 }
        ]
      }
    },
    {
      key: 'cisControls',
      name: 'CIS Controls',
      color: '#8b5cf6',
      zone: {
        points: [
          { x: centerX + radius * 0.1, y: centerY + radius * 0.6 },
          { x: centerX - radius * 0.3, y: centerY + radius * 0.8 },
          { x: centerX - radius * 0.8, y: centerY + radius * 0.3 },
          { x: centerX - radius * 0.4, y: centerY - radius * 0.1 },
          { x: centerX + radius * 0.1, y: centerY + radius * 0.1 }
        ]
      }
    },
    {
      key: 'gdpr',
      name: 'GDPR',
      color: '#f97316',
      zone: {
        points: [
          { x: centerX - radius * 0.7, y: centerY + radius * 0.2 },
          { x: centerX - radius * 0.8, y: centerY - radius * 0.4 },
          { x: centerX - radius * 0.2, y: centerY - radius * 0.7 },
          { x: centerX + radius * 0.1, y: centerY - radius * 0.2 },
          { x: centerX - radius * 0.2, y: centerY + radius * 0.4 }
        ]
      }
    },
    {
      key: 'nis2',
      name: 'NIS2',
      color: '#ef4444',
      zone: {
        points: [
          { x: centerX - radius * 0.1, y: centerY - radius * 0.6 },
          { x: centerX + radius * 0.3, y: centerY - radius * 0.8 },
          { x: centerX + radius * 0.8, y: centerY - radius * 0.3 },
          { x: centerX + radius * 0.4, y: centerY + radius * 0.1 },
          { x: centerX - radius * 0.1, y: centerY - radius * 0.1 }
        ]
      }
    }
  ];

  // AR Unified zone (covers the entire pentagon with semi-transparency)
  const unifiedZonePoints = pentagonPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 overflow-hidden">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Framework Coverage Visualization</h3>
        <p className="text-gray-600 dark:text-gray-400">
          The pentagon shows how AuditReady Unified (transparent overlay) covers all framework requirements
        </p>
      </div>
      
      <svg
        width="100%"
        height="700"
        viewBox="0 0 1200 700"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        <defs>
          {/* Pentagon gradient */}
          <linearGradient id="pentagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
          </linearGradient>
          
          {/* AR Unified gradient - enhanced visibility */}
          <linearGradient id="unifiedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="30%" stopColor="#8b5cf6" stopOpacity="0.30" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
          </linearGradient>

          {/* Framework specific gradients */}
          {frameworkConfigs.map(config => (
            <linearGradient key={config.key} id={`${config.key}Gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={config.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.3" />
            </linearGradient>
          ))}
        </defs>

        {/* Pentagon base */}
        <motion.polygon
          points={unifiedZonePoints}
          fill="url(#pentagonGradient)"
          stroke="#94a3b8"
          strokeWidth="3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Framework zones (only show selected frameworks) */}
        {frameworkConfigs.map((config, index) => {
          if (!selectedFrameworks[config.key]) return null;
          
          const zonePoints = config.zone.points.map(p => `${p.x},${p.y}`).join(' ');
          
          return (
            <motion.g key={config.key}>
              <motion.polygon
                points={zonePoints}
                fill={`url(#${config.key}Gradient)`}
                stroke={config.color}
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              />
              
              {/* Framework label */}
              <motion.g
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                <circle
                  cx={config.zone.points[0].x}
                  cy={config.zone.points[0].y - 30}
                  r="25"
                  fill={config.color}
                  opacity="0.95"
                />
                <text
                  x={config.zone.points[0].x}
                  y={config.zone.points[0].y - 25}
                  textAnchor="middle"
                  className="text-sm font-bold fill-white"
                >
                  {config.name}
                </text>
              </motion.g>
            </motion.g>
          );
        })}

        {/* AR Unified overlay (covers entire pentagon) */}
        <motion.polygon
          points={unifiedZonePoints}
          fill="url(#unifiedGradient)"
          stroke="#6366f1"
          strokeWidth="4"
          strokeDasharray="15,5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* Pentagon corner labels */}
        {pentagonPoints.map((point, index) => {
          const labels = ['Governance', 'Physical', 'Technical', 'Operational', 'Privacy'];
          return (
            <motion.g
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r="25"
                fill="#1e293b"
                opacity="0.9"
              />
              <text
                x={point.x}
                y={point.y + 5}
                textAnchor="middle"
                className="text-xs font-semibold fill-white"
              >
                {labels[index]}
              </text>
            </motion.g>
          );
        })}

        {/* Center AR Unified label */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <circle
            cx={centerX}
            cy={centerY}
            r="60"
            fill="#6366f1"
            opacity="0.9"
          />
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-sm font-bold fill-white"
          >
            AuditReady
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-sm font-bold fill-white"
          >
            Unified
          </text>
        </motion.g>
      </svg>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {frameworkConfigs
          .filter(config => selectedFrameworks[config.key])
          .map(config => (
            <div key={config.key} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded border-2"
                style={{ 
                  backgroundColor: config.color,
                  opacity: 0.6,
                  borderColor: config.color
                }}
              />
              <span className="text-sm font-medium">{config.name}</span>
            </div>
          ))}
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded border-2"
            style={{ 
              backgroundColor: '#6366f1',
              opacity: 0.3,
              borderColor: '#6366f1'
            }}
          />
          <span className="text-sm font-medium">AuditReady Unified</span>
        </div>
      </div>
    </div>
  );
};