import React from 'react';
import { motion } from 'framer-motion';

interface PentagonVisualizationProps {
  selectedFrameworks: Record<string, boolean>;
  mappingData: any[];
}

interface FrameworkStats {
  totalRequirements: number;
  coverage: number; // Percentage of total requirements in the system
  mappings: number; // Number of unified mappings this framework appears in
}

export const PentagonVisualization: React.FC<PentagonVisualizationProps> = ({
  selectedFrameworks,
  mappingData
}) => {
  // Pentagon coordinates (centered in 1200x800 viewBox)
  const centerX = 600;
  const centerY = 400;
  const radius = 300;
  
  // Hover state for interactive highlighting
  const [hoveredFramework, setHoveredFramework] = React.useState<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = React.useState<number | null>(null);
  const [hoveredUnified, setHoveredUnified] = React.useState<boolean>(false);
  
  // Calculate dynamic framework statistics from mapping data
  const frameworkStats: Record<string, FrameworkStats> = {
    iso27001: { totalRequirements: 0, coverage: 0, mappings: 0 },
    iso27002: { totalRequirements: 0, coverage: 0, mappings: 0 },
    cisControls: { totalRequirements: 0, coverage: 0, mappings: 0 },
    gdpr: { totalRequirements: 0, coverage: 0, mappings: 0 },
    nis2: { totalRequirements: 0, coverage: 0, mappings: 0 }
  };
  
  // Calculate statistics from actual mapping data
  mappingData.forEach(mapping => {
    Object.keys(frameworkStats).forEach(framework => {
      if (mapping.frameworks?.[framework]?.length > 0) {
        frameworkStats[framework].totalRequirements += mapping.frameworks[framework].length;
        frameworkStats[framework].mappings += 1;
      }
    });
  });
  
  // Calculate coverage percentages
  const totalAllRequirements = Object.values(frameworkStats).reduce((sum, stat) => sum + stat.totalRequirements, 0);
  Object.keys(frameworkStats).forEach(framework => {
    frameworkStats[framework].coverage = totalAllRequirements > 0 
      ? (frameworkStats[framework].totalRequirements / totalAllRequirements) * 100 
      : 0;
  });
  
  // Calculate pentagon points
  const pentagonPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  // Generate proper area coverage based on actual framework characteristics
  const generateAreaCoverage = (frameworkKey: string, stats: FrameworkStats) => {
    // Define which areas each framework actually covers
    const getFrameworkAreas = (key: string) => {
      switch (key) {
        case 'iso27001': // Governance + Operational
          return [0, 3]; // Governance, Operational
        case 'iso27002': // Physical + Technical + Operational (full coverage)
          return [1, 2, 3]; // Physical, Technical, Operational
        case 'cisControls': // Technical + Operational
          return [2, 3]; // Technical, Operational
        case 'gdpr': // Privacy + Governance
          return [0, 4]; // Governance, Privacy
        case 'nis2': // Semi-Operational + Semi-Governance + Semi-Technical + Quarter-GDPR
          return [0, 2, 3, 4]; // Governance (partial), Technical (partial), Operational (partial), Privacy (quarter)
        default:
          return [0];
      }
    };
    
    const areaIndices = getFrameworkAreas(frameworkKey);
    const points = [];
    
    // Start from center
    points.push({ x: centerX, y: centerY });
    
    // Create area that covers multiple domains
    if (areaIndices.length === 1) {
      // Single domain - create a sector
      const domainIndex = areaIndices[0];
      const domainPoint = pentagonPoints[domainIndex];
      const angle = Math.atan2(domainPoint.y - centerY, domainPoint.x - centerX);
      const sectorWidth = Math.PI / 3; // 60 degrees
      
      // Create sector points
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const currentAngle = angle - sectorWidth/2 + t * sectorWidth;
        const distance = radius * 0.8;
        
        points.push({
          x: centerX + Math.cos(currentAngle) * distance,
          y: centerY + Math.sin(currentAngle) * distance
        });
      }
    } else {
      // Multiple domains - create shape that covers the areas
      areaIndices.forEach((domainIndex, i) => {
        const domainPoint = pentagonPoints[domainIndex];
        const nextDomainIndex = areaIndices[(i + 1) % areaIndices.length];
        const nextDomainPoint = pentagonPoints[nextDomainIndex];
        
        // Special handling for framework partial coverage
        let coverageDistance = 0.9;
        if (frameworkKey === 'nis2') {
          if (domainIndex === 0 || domainIndex === 2 || domainIndex === 3) { // Governance, Technical, or Operational
            coverageDistance = 0.5; // Halfway coverage
          } else if (domainIndex === 4) { // Privacy (GDPR)
            coverageDistance = 0.15; // Reduced privacy coverage to avoid overlap
          }
        }
        
        points.push({
          x: centerX + (domainPoint.x - centerX) * coverageDistance,
          y: centerY + (domainPoint.y - centerY) * coverageDistance
        });
        
        // If there's a next domain, curve along the pentagon edge
        if (i < areaIndices.length - 1) {
          // Add intermediate points along pentagon edge
          const steps = 6;
          for (let step = 1; step < steps; step++) {
            const t = step / steps;
            const midX = domainPoint.x + (nextDomainPoint.x - domainPoint.x) * t;
            const midY = domainPoint.y + (nextDomainPoint.y - domainPoint.y) * t;
            
            // Curve slightly inward, adjust for partial coverage
            const inwardFactor = (frameworkKey === 'nis2' && (domainIndex === 0 || domainIndex === 2 || domainIndex === 3 || domainIndex === 4)) ? 0.3 : 0.1;
            points.push({
              x: midX + (centerX - midX) * inwardFactor,
              y: midY + (centerY - midY) * inwardFactor
            });
          }
        }
      });
    }
    
    // Special extension for GDPR towards Operational
    if (frameworkKey === 'gdpr') {
      const operationalPoint = pentagonPoints[3]; // Operational domain
      const extensionDistance = 0.25; // Small extension towards operational
      points.push({
        x: centerX + (operationalPoint.x - centerX) * extensionDistance,
        y: centerY + (operationalPoint.y - centerY) * extensionDistance
      });
    }
    
    return points;
  };
  
  // Convert sausage points to ultra-smooth SVG path
  const sausageToSVGPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Ultra-smooth curves for premium sausage shapes
    const tension = 0.4; // High tension for perfect roundness
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const prev = points[i - 1];
      const next = points[(i + 1) % points.length];
      
      // Premium control points for silk-smooth sausage curves
      const cp1x = prev.x + (current.x - prev.x) * tension;
      const cp1y = prev.y + (current.y - prev.y) * tension;
      
      const cp2x = current.x - (next.x - prev.x) * tension * 0.3;
      const cp2y = current.y - (next.y - prev.y) * tension * 0.3;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }
    
    path += ' Z';
    return path;
  };
  
  // Framework configurations with organic blob shapes
  const frameworkConfigs = [
    {
      key: 'iso27001',
      name: 'ISO 27001',
      color: '#3b82f6',
      secondaryColor: '#60a5fa',
      stats: frameworkStats.iso27001,
      zone: {
        points: generateAreaCoverage('iso27001', frameworkStats.iso27001),
        path: ''
      }
    },
    {
      key: 'iso27002',
      name: 'ISO 27002',
      color: '#10b981',
      secondaryColor: '#34d399',
      stats: frameworkStats.iso27002,
      zone: {
        points: generateAreaCoverage('iso27002', frameworkStats.iso27002),
        path: ''
      }
    },
    {
      key: 'cisControls',
      name: 'CIS Controls',
      color: '#8b5cf6',
      secondaryColor: '#a78bfa',
      stats: frameworkStats.cisControls,
      zone: {
        points: generateAreaCoverage('cisControls', frameworkStats.cisControls),
        path: ''
      }
    },
    {
      key: 'gdpr',
      name: 'GDPR',
      color: '#f97316',
      secondaryColor: '#fb923c',
      stats: frameworkStats.gdpr,
      zone: {
        points: generateAreaCoverage('gdpr', frameworkStats.gdpr),
        path: ''
      }
    },
    {
      key: 'nis2',
      name: 'NIS2',
      color: '#ef4444',
      secondaryColor: '#f87171',
      stats: frameworkStats.nis2,
      zone: {
        points: generateAreaCoverage('nis2', frameworkStats.nis2),
        path: ''
      }
    }
  ];
  
  // Generate SVG paths for area coverage
  frameworkConfigs.forEach(config => {
    config.zone.path = sausageToSVGPath(config.zone.points);
  });

  // AR Unified zone (covers the entire pentagon with semi-transparency)
  const unifiedZonePoints = pentagonPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 overflow-hidden">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Premium Framework Coverage Visualization
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Experience how AuditReady Unified seamlessly orchestrates comprehensive framework coverage across all security domains
        </p>
      </div>
      
      <svg
        width="100%"
        height="800"
        viewBox="0 0 1200 800"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))', aspectRatio: '3/2' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Pentagon base gradient - subtle security theme */}
          <radialGradient id="pentagonGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.95" />
          </radialGradient>
          
          {/* AR Unified gradient - premium security overlay */}
          <radialGradient id="unifiedGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.20" />
          </radialGradient>
          
          {/* Center hexagon gradient */}
          <radialGradient id="centerHexGradient" cx="30%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3730a3" stopOpacity="0.85" />
          </radialGradient>

          {/* Clear framework gradients - reduced opacity for better visibility */}
          {frameworkConfigs.map(config => (
            <linearGradient key={config.key} id={`${config.key}Gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.secondaryColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
          
          
          {/* Professional shadow for depth */}
          <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" floodColor="#1e293b"/>
          </filter>
          
          {/* Soft inner glow */}
          <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
          
          {/* Subtle pentagon glow effect for AuditReady Unified hover */}
          <filter id="pentagonGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="softGlow"/>
            <feColorMatrix in="softGlow" mode="matrix" values="0 0 0 0 0.31  0 0 0 0 0.27  0 0 0 0 0.89  0 0 0 0.8 0" result="coloredGlow"/>
            <feMerge>
              <feMergeNode in="coloredGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Ultra-subtle unified gradient for hover */}
          <radialGradient id="unifiedHoverGradient" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
          </radialGradient>
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

        {/* Framework area coverage shapes */}
        {frameworkConfigs.filter(config => {
          // Only show if framework is actually selected
          if (config.key === 'cisControls') {
            return selectedFrameworks.cisControls !== null; // CIS Controls uses IG levels
          }
          return selectedFrameworks[config.key] === true; // Others use boolean
        }).filter(config => config.zone.path).map((config, index) => {
          
          return (
            <motion.g 
              key={config.key}
              onMouseEnter={() => setHoveredFramework(config.key)}
              onMouseLeave={() => setHoveredFramework(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Area coverage shape - improved visibility */}
              <motion.path
                d={config.zone.path}
                fill={`url(#${config.key}Gradient)`}
                stroke={config.color}
                strokeWidth={hoveredFramework === config.key ? "5" : "3"}
                strokeOpacity={hoveredFramework === config.key ? "1" : "0.9"}
                fillOpacity={hoveredFramework === config.key ? "0.8" : "1"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: hoveredFramework === null || hoveredFramework === config.key ? 1 : 0.4,
                  scale: hoveredFramework === config.key ? 1.02 : 1
                }}
                transition={{ 
                  duration: hoveredFramework ? 0.2 : 0.8, 
                  delay: hoveredFramework ? 0 : index * 0.2, 
                  ease: "easeOut"
                }}
                style={{
                  transformOrigin: 'center',
                  mixBlendMode: 'normal',
                  filter: hoveredFramework === config.key ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'none'
                }}
              />
              
              {/* Framework label overlay for clarity */}
              <motion.text
                x={(() => {
                  // Calculate center of the framework area
                  const points = config.zone.points;
                  const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
                  return avgX;
                })()}
                y={(() => {
                  const points = config.zone.points;
                  const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
                  return avgY;
                })()}
                textAnchor="middle"
                className="text-sm font-bold fill-white"
                style={{
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
                  pointerEvents: 'none'
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: hoveredFramework === null || hoveredFramework === config.key ? 1 : 0.3,
                  scale: hoveredFramework === config.key ? 1.1 : 1
                }}
                transition={{ duration: hoveredFramework ? 0.2 : 0.5, delay: hoveredFramework ? 0 : index * 0.2 + 0.5 }}
              >
                {config.name}
              </motion.text>
            </motion.g>
          );
        })}

        {/* AR Unified overlay - premium security coverage */}
        <motion.polygon
          points={unifiedZonePoints}
          fill={hoveredUnified ? "url(#unifiedHoverGradient)" : "url(#unifiedGradient)"}
          stroke="#4f46e5"
          strokeWidth={hoveredUnified ? "4" : "2"}
          strokeDasharray={hoveredUnified ? "0" : "20,8"}
          filter={hoveredUnified ? "url(#pentagonGlow)" : "none"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: hoveredUnified ? 0.9 : 0.7, 
            scale: hoveredUnified ? 1.01 : 1,
            strokeOpacity: hoveredUnified ? 1 : 0.6
          }}
          transition={{ 
            duration: 0.3,
            delay: hoveredUnified ? 0 : 1,
            ease: "easeInOut"
          }}
          style={{
            transformOrigin: 'center'
          }}
        />

        {/* Clean, modern domain labels */}
        {pentagonPoints.map((point, index) => {
          const labels = ['Governance', 'Physical', 'Technical', 'Operational', 'Privacy'];
          const icons = ['🛡️', '🏢', '⚙️', '🔧', '🔒'];
          const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444'];
          
          return (
            <motion.g
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: hoveredDomain === null || hoveredDomain === index ? 1 : 0.5,
                scale: hoveredDomain === index ? 1.05 : 1
              }}
              transition={{ 
                duration: hoveredDomain !== null ? 0.2 : 0.6, 
                delay: hoveredDomain !== null ? 0 : 1.2 + index * 0.1,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredDomain(index)}
              onMouseLeave={() => setHoveredDomain(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Clean rounded rectangle background */}
              <rect
                x={index === 3 ? point.x - 60 : point.x - 55} // Wider for Operational
                y={point.y - 20}
                width={index === 3 ? 120 : 110} // Wider for Operational
                height="40"
                rx="20"
                ry="20"
                fill="#1e293b"
                stroke={colors[index]}
                strokeWidth="2"
                filter="url(#subtleShadow)"
                opacity="0.95"
              />
              
              {/* Inner glow */}
              <rect
                x={index === 3 ? point.x - 55 : point.x - 50} // Wider for Operational
                y={point.y - 15}
                width={index === 3 ? 110 : 100} // Wider for Operational
                height="30"
                rx="15"
                ry="15"
                fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              
              {/* Domain icon - bigger with proper spacing */}
              <text
                x={index === 3 ? point.x - 35 : point.x - 30} // Extra space for Operational
                y={point.y + 6}
                textAnchor="middle"
                className="text-xl"
              >
                {icons[index]}
              </text>
              
              {/* Domain label - properly spaced */}
              <text
                x={index === 3 ? point.x + 20 : point.x + 15} // Extra space for Operational
                y={point.y + 5}
                textAnchor="middle"
                className="text-sm font-semibold fill-white"
                style={{ letterSpacing: '0.5px' }}
              >
                {labels[index]}
              </text>
            </motion.g>
          );
        })}

        {/* Ultra-premium AuditReady Unified center badge */}
        <motion.g
          initial={{ opacity: 0, scale: 0.2, rotate: -360 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            // Gentle floating animation
            y: [0, -4, 0]
          }}
          transition={{ 
            duration: 1.2, 
            delay: 2,
            type: "spring",
            stiffness: 120,
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ transformOrigin: 'center' }}
        >
          {/* Outer glow ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r="110"
            fill="none"
            stroke="url(#unifiedGradient)"
            strokeWidth="3"
            strokeOpacity="0.3"
            filter="url(#innerGlow)"
          />
          
          {/* Premium hexagonal center badge */}
          <polygon
            points={`${centerX},${centerY-70} ${centerX+60},${centerY-35} ${centerX+60},${centerY+35} ${centerX},${centerY+70} ${centerX-60},${centerY+35} ${centerX-60},${centerY-35}`}
            fill="url(#centerHexGradient)"
            stroke="#4f46e5"
            strokeWidth="3"
            filter="url(#subtleShadow)"
            opacity="0.95"
          />
          
          {/* Inner hexagonal highlight */}
          <polygon
            points={`${centerX},${centerY-50} ${centerX+43},${centerY-25} ${centerX+43},${centerY+25} ${centerX},${centerY+50} ${centerX-43},${centerY+25} ${centerX-43},${centerY-25}`}
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
          
          {/* Premium security shield icon */}
          <text
            x={centerX}
            y={centerY - 18}
            textAnchor="middle"
            className="text-2xl"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            🛡️
          </text>
          
          {/* Premium brand text */}
          <text
            x={centerX}
            y={centerY + 8}
            textAnchor="middle"
            className="text-lg font-black fill-white"
            style={{ 
              letterSpacing: '1.5px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            }}
          >
            AUDITREADY
          </text>
          <text
            x={centerX}
            y={centerY + 28}
            textAnchor="middle"
            className="text-sm font-bold fill-slate-100"
            style={{ 
              letterSpacing: '3px',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
            }}
          >
            UNIFIED
          </text>
        </motion.g>
      </svg>

      {/* Interactive Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {frameworkConfigs
          .filter(config => {
            // Only show legend for actually selected frameworks
            if (config.key === 'cisControls') {
              return selectedFrameworks.cisControls !== null; // CIS Controls uses IG levels
            }
            return selectedFrameworks[config.key] === true; // Others use boolean
          })
          .map(config => (
            <motion.div 
              key={config.key} 
              className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: hoveredFramework === config.key ? `${config.color}20` : 'transparent',
                border: hoveredFramework === config.key ? `2px solid ${config.color}` : '2px solid transparent'
              }}
              onMouseEnter={() => setHoveredFramework(config.key)}
              onMouseLeave={() => setHoveredFramework(null)}
              animate={{
                scale: hoveredFramework === config.key ? 1.05 : 1,
                y: hoveredFramework === config.key ? -2 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-5 h-5 rounded border-2"
                style={{ 
                  backgroundColor: config.color,
                  opacity: hoveredFramework === null || hoveredFramework === config.key ? 0.8 : 0.4,
                  borderColor: config.color,
                  boxShadow: hoveredFramework === config.key ? `0 0 10px ${config.color}50` : 'none'
                }}
                animate={{
                  scale: hoveredFramework === config.key ? 1.2 : 1
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span 
                className="text-sm font-medium"
                style={{
                  color: hoveredFramework === config.key ? config.color : 'inherit',
                  fontWeight: hoveredFramework === config.key ? 'bold' : 'normal'
                }}
                animate={{
                  opacity: hoveredFramework === null || hoveredFramework === config.key ? 1 : 0.6
                }}
                transition={{ duration: 0.2 }}
              >
                {config.name}
              </motion.span>
            </motion.div>
          ))}
        <motion.div 
          className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: hoveredUnified ? '#6366f130' : (hoveredFramework === null ? 'transparent' : '#6366f120'),
            border: hoveredUnified ? '2px solid #6366f1' : '2px solid transparent'
          }}
          onMouseEnter={() => setHoveredUnified(true)}
          onMouseLeave={() => setHoveredUnified(false)}
          animate={{
            scale: hoveredUnified ? 1.05 : 1,
            y: hoveredUnified ? -2 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-5 h-5 rounded border-2"
            style={{ 
              backgroundColor: '#6366f1',
              opacity: hoveredUnified ? 1 : (hoveredFramework === null ? 0.4 : 0.6),
              borderColor: '#6366f1',
              boxShadow: hoveredUnified ? '0 0 10px #6366f150' : 'none'
            }}
            animate={{
              scale: hoveredUnified ? 1.2 : 1
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.span 
            className="text-sm font-medium"
            style={{
              color: hoveredUnified ? '#6366f1' : 'inherit',
              fontWeight: hoveredUnified ? 'bold' : 'normal',
              opacity: hoveredUnified ? 1 : (hoveredFramework === null ? 1 : 0.8)
            }}
            animate={{
              opacity: hoveredUnified ? 1 : (hoveredFramework === null ? 1 : 0.6)
            }}
            transition={{ duration: 0.2 }}
          >
            AuditReady Unified
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};