import React from 'react';
import { motion } from 'framer-motion';

interface PentagonVisualizationProps {
  selectedFrameworks: Record<string, boolean>;
  mappingData: Array<{
    id: string;
    category: string;
    frameworks: Record<string, Array<{ code: string; title: string; description: string }>>;
    pentagon_domain?: number;
  }>;
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
  // Debug: Log the entire selectedFrameworks object
  React.useEffect(() => {
    console.log('🔍 FULL DEBUG - selectedFrameworks:', selectedFrameworks);
    console.log('🔍 FULL DEBUG - Object.keys(selectedFrameworks):', Object.keys(selectedFrameworks));
    console.log('🔍 FULL DEBUG - selectedFrameworks.cisControls:', selectedFrameworks.cisControls);
  }, [selectedFrameworks]);
  // Pentagon coordinates (centered in 1200x800 viewBox)
  const centerX = 600;
  const centerY = 400;
  const radius = 300;
  
  // Hover state for interactive highlighting
  const [hoveredFramework, setHoveredFramework] = React.useState<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = React.useState<number | null>(null);
  const [hoveredUnified, setHoveredUnified] = React.useState<boolean>(false);
  const [hideLogo, setHideLogo] = React.useState<boolean>(false);
  
  // Calculate dynamic framework statistics from mapping data
  const frameworkStats: Record<string, FrameworkStats> = {
    iso27001: { totalRequirements: 0, coverage: 0, mappings: 0 },
    iso27002: { totalRequirements: 0, coverage: 0, mappings: 0 },
    cisControls: { totalRequirements: 0, coverage: 0, mappings: 0 },
    gdpr: { totalRequirements: 0, coverage: 0, mappings: 0 },
    nis2: { totalRequirements: 0, coverage: 0, mappings: 0 },
    dora: { totalRequirements: 0, coverage: 0, mappings: 0 }
  };
  
  // Calculate statistics from actual mapping data
  mappingData.forEach(mapping => {
    Object.keys(frameworkStats).forEach(framework => {
      if (mapping.frameworks?.[framework]?.length > 0) {
        const frameworkData = frameworkStats[framework];
        if (frameworkData) {
          frameworkData.totalRequirements += mapping.frameworks[framework].length;
          frameworkData.mappings += 1;
        }
      }
    });
  });

  // Calculate actual overlaps between frameworks
  const frameworkOverlaps: Record<string, Set<string>> = {};
  Object.keys(frameworkStats).forEach(fw => {
    frameworkOverlaps[fw] = new Set();
  });

  mappingData.forEach(mapping => {
    const frameworksInThisCategory = Object.keys(mapping.frameworks).filter(
      fw => mapping.frameworks[fw] && mapping.frameworks[fw].length > 0
    );
    
    // Record overlaps between frameworks that share this category
    for (let i = 0; i < frameworksInThisCategory.length; i++) {
      for (let j = i + 1; j < frameworksInThisCategory.length; j++) {
        const fw1 = frameworksInThisCategory[i];
        const fw2 = frameworksInThisCategory[j];
        if (fw1 && fw2 && frameworkOverlaps[fw1] && frameworkOverlaps[fw2]) {
          frameworkOverlaps[fw1].add(fw2);
          frameworkOverlaps[fw2].add(fw1);
        }
      }
    }
  });
  
  // Calculate coverage percentages
  const totalAllRequirements = Object.values(frameworkStats).reduce((sum, stat) => sum + stat.totalRequirements, 0);
  Object.keys(frameworkStats).forEach(framework => {
    const frameworkData = frameworkStats[framework];
    if (frameworkData) {
      frameworkData.coverage = totalAllRequirements > 0 
        ? (frameworkData.totalRequirements / totalAllRequirements) * 100 
        : 0;
    }
  });
  
  // Calculate pentagon points
  const pentagonPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  // Generate truthful area coverage based on database pentagon_domain mapping with intensity
  const generateAreaCoverage = (frameworkKey: string) => {
    // Calculate domain coverage intensity (not just presence) based on database mapping
    const getFrameworkAreaIntensity = (key: string) => {
      const domainIntensity: Record<number, number> = {};
      
      // Calculate intensity (number of requirements) per domain
      mappingData.forEach(mapping => {
        if (mapping.frameworks[key] && mapping.frameworks[key].length > 0) {
          const domainIndex = mapping.pentagon_domain;
          const requirementCount = mapping.frameworks[key].length;
          
          // Debug DORA specifically
          if (key === 'dora') {
            console.log(`🔍 DORA MAPPING DEBUG - Category: ${mapping.category}, Domain: ${domainIndex}, Requirements: ${requirementCount}`);
          }
          
          if (domainIndex !== undefined && domainIndex !== null && 
              domainIndex >= 0 && domainIndex <= 4) {
            domainIntensity[domainIndex] = (domainIntensity[domainIndex] || 0) + requirementCount;
            
            // Debug DORA domain assignment
            if (key === 'dora') {
              console.log(`🔍 DORA DOMAIN DEBUG - Added ${requirementCount} requirements to domain ${domainIndex}, total now: ${domainIntensity[domainIndex]}`);
            }
          } else if (key === 'dora') {
            console.warn(`⚠️ DORA DOMAIN WARNING - Category "${mapping.category}" has invalid pentagon_domain: ${domainIndex}`);
          }
        }
      });
      
      return domainIntensity;
    };
    
    const domainIntensity = getFrameworkAreaIntensity(frameworkKey);
    const coveredDomains = Object.keys(domainIntensity).map(Number).sort();
    
    
    const points = [];
    
    // Start from center
    points.push({ x: centerX, y: centerY });
    
    if (coveredDomains.length === 0) return points;
    
    // Calculate max intensity for normalization
    const maxIntensity = Math.max(...Object.values(domainIntensity));
    
    // Create area that reflects actual coverage intensity
    if (coveredDomains.length === 1) {
      // Single domain - create a sector with intensity-based distance
      const domainIndex = coveredDomains[0];
      const domainPoint = pentagonPoints[domainIndex];
      if (!domainPoint) return points;
      
      const intensity = domainIntensity[domainIndex] || 0;
      const normalizedIntensity = intensity / maxIntensity;
      const coverageDistance = 0.45 + (normalizedIntensity * 0.25); // Range: 0.45-0.70 (keep within pentagon)
      
      const angle = Math.atan2(domainPoint.y - centerY, domainPoint.x - centerX);
      const sectorWidth = Math.PI / 4; // 45 degrees
      
      // Create sector points
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const currentAngle = angle - sectorWidth/2 + t * sectorWidth;
        const distance = radius * coverageDistance;
        
        points.push({
          x: centerX + Math.cos(currentAngle) * distance,
          y: centerY + Math.sin(currentAngle) * distance
        });
      }
    } else {
      // Multiple domains - create shape with different distances per domain based on intensity
      coveredDomains.forEach((domainIndex, i) => {
        const domainPoint = pentagonPoints[domainIndex];
        if (!domainPoint) return;
        
        // Calculate coverage distance based on intensity for this specific domain
        const intensity = domainIntensity[domainIndex] || 0;
        const normalizedIntensity = intensity / maxIntensity;
        const coverageDistance = 0.45 + (normalizedIntensity * 0.25); // Range: 0.45-0.70 (keep within pentagon)
        
        points.push({
          x: centerX + (domainPoint.x - centerX) * coverageDistance,
          y: centerY + (domainPoint.y - centerY) * coverageDistance
        });
        
        // Add intermediate points between domains for smooth curves
        if (i < coveredDomains.length - 1) {
          const nextDomainIndex = coveredDomains[i + 1];
          const nextDomainPoint = pentagonPoints[nextDomainIndex];
          if (!nextDomainPoint) return;
          
          const nextIntensity = domainIntensity[nextDomainIndex] || 0;
          const nextNormalizedIntensity = nextIntensity / maxIntensity;
          const nextCoverageDistance = 0.5 + (nextNormalizedIntensity * 0.35);
          
          // Create curve between domains with intensity-based positioning
          const steps = 4;
          for (let step = 1; step < steps; step++) {
            const t = step / steps;
            const avgDistance = coverageDistance + (nextCoverageDistance - coverageDistance) * t;
            const midX = domainPoint.x + (nextDomainPoint.x - domainPoint.x) * t;
            const midY = domainPoint.y + (nextDomainPoint.y - domainPoint.y) * t;
            
            // Curve slightly inward for visual appeal
            const inwardFactor = 0.15;
            points.push({
              x: midX + (centerX - midX) * inwardFactor,
              y: midY + (centerY - midY) * inwardFactor
            });
          }
        }
      });
    }
    
    // NO SPECIAL EXTENSIONS - All frameworks stay within pentagon boundaries
    // Areas are determined purely by database category mappings
    
    return points;
  };
  
  // Convert sausage points to ultra-smooth SVG path
  const sausageToSVGPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0 || !points[0]) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Ultra-smooth curves for premium sausage shapes
    const tension = 0.4; // High tension for perfect roundness
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const prev = points[i - 1];
      const next = points[(i + 1) % points.length];
      
      if (!current || !prev || !next) continue;
      
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
  
  // Helper function to check if framework is selected
  const isFrameworkSelected = (key: string) => {
    const selection = selectedFrameworks[key];
    if (key === 'cisControls') {
      // Accept both boolean true and string values (ig1, ig2, ig3) for CIS Controls
      const result = selection === true || (selection && typeof selection === 'string' && selection !== '');
      console.log(`🔍 CIS DEBUG - key: ${key}, selection: ${selection}, type: ${typeof selection}, result: ${result}`);
      return result;
    } else if (key === 'dora') {
      // Debug DORA selection specifically
      const result = selection === true;
      console.log(`🔍 DORA DEBUG - key: ${key}, selection: ${selection}, type: ${typeof selection}, result: ${result}`);
      return result;
    } else {
      return selection === true;
    }
  };

  // Framework configurations with organic blob shapes - only generate areas for selected frameworks
  const frameworkConfigs = [
    {
      key: 'iso27001',
      name: 'ISO 27001',
      color: '#3b82f6',
      secondaryColor: '#60a5fa',
      stats: frameworkStats['iso27001'] || { totalRequirements: 0, coverage: 0, mappings: 0 },
      zone: {
        points: isFrameworkSelected('iso27001') ? generateAreaCoverage('iso27001') : [],
        path: ''
      }
    },
    {
      key: 'iso27002',
      name: 'ISO 27002',
      color: '#10b981',
      secondaryColor: '#34d399',
      stats: frameworkStats['iso27002'] || { totalRequirements: 0, coverage: 0, mappings: 0 },
      zone: {
        points: isFrameworkSelected('iso27002') ? generateAreaCoverage('iso27002') : [],
        path: ''
      }
    },
    {
      key: 'cisControls',
      name: 'CIS Controls',
      color: '#8b5cf6',
      secondaryColor: '#a78bfa',
      stats: frameworkStats['cisControls'] || { totalRequirements: 0, coverage: 0, mappings: 0 },
      zone: {
        points: (() => {
          const selected = isFrameworkSelected('cisControls');
          console.log(`🔍 CIS AREA DEBUG - isSelected: ${selected}`);
          if (selected) {
            const points = generateAreaCoverage('cisControls');
            console.log(`🔍 CIS AREA DEBUG - generated points:`, points);
            return points;
          }
          return [];
        })(),
        path: ''
      }
    },
    {
      key: 'gdpr',
      name: 'GDPR',
      color: '#f97316',
      secondaryColor: '#fb923c',
      stats: frameworkStats['gdpr'] || { totalRequirements: 0, coverage: 0, mappings: 0 },
      zone: {
        points: isFrameworkSelected('gdpr') ? generateAreaCoverage('gdpr') : [],
        path: ''
      }
    },
    {
      key: 'nis2',
      name: 'NIS2',
      color: '#ef4444',
      secondaryColor: '#f87171',
      stats: frameworkStats['nis2'] || { totalRequirements: 0, coverage: 0, mappings: 0 },
      zone: {
        points: isFrameworkSelected('nis2') ? generateAreaCoverage('nis2') : [],
        path: ''
      }
    },
    {
      key: 'dora',
      name: 'DORA',
      color: '#dc2626',
      secondaryColor: '#ef4444',
      stats: frameworkStats['dora'] || { totalRequirements: 0, coverage: 0, mappings: 0 },
      zone: {
        points: (() => {
          const selected = isFrameworkSelected('dora');
          console.log(`🔍 DORA AREA DEBUG - isSelected: ${selected}`);
          if (selected) {
            const points = generateAreaCoverage('dora');
            console.log(`🔍 DORA AREA DEBUG - generated points:`, points);
            return points;
          }
          return [];
        })(),
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
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 overflow-hidden">
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
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

          {/* Enhanced framework gradients with reduced opacity for better transparency */}
          {frameworkConfigs.map(config => (
            <linearGradient key={config.key} id={`${config.key}Gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.secondaryColor} stopOpacity="0.6" />
              <stop offset="50%" stopColor={config.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.4" />
            </linearGradient>
          ))}

          {/* Distinct patterns for print/screenshot clarity */}
          <pattern id="iso27001Pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#3b82f6" opacity="0.1"/>
            <path d="M0,4 l8,0" stroke="#3b82f6" strokeWidth="1" opacity="0.3"/>
          </pattern>
          
          <pattern id="iso27002Pattern" patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="6" height="6" fill="#10b981" opacity="0.1"/>
            <circle cx="3" cy="3" r="1" fill="#10b981" opacity="0.4"/>
          </pattern>
          
          <pattern id="cisControlsPattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="#8b5cf6" opacity="0.1"/>
            <path d="M0,0 l10,10 M0,10 l10,-10" stroke="#8b5cf6" strokeWidth="1" opacity="0.3"/>
          </pattern>
          
          <pattern id="gdprPattern" patternUnits="userSpaceOnUse" width="12" height="12">
            <rect width="12" height="12" fill="#f97316" opacity="0.1"/>
            <rect x="2" y="2" width="3" height="3" fill="#f97316" opacity="0.3"/>
            <rect x="7" y="7" width="3" height="3" fill="#f97316" opacity="0.3"/>
          </pattern>
          
          <pattern id="nis2Pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#ef4444" opacity="0.1"/>
            <path d="M0,0 l4,4 l4,-4" stroke="#ef4444" strokeWidth="1" opacity="0.3" fill="none"/>
          </pattern>
          
          
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

        {/* Framework area coverage shapes with dynamic z-index for hover */}
        {frameworkConfigs.filter(config => {
          // Only show if framework is actually selected
          const selected = isFrameworkSelected(config.key);
          console.log(`🔍 FILTER DEBUG - ${config.key}: selected=${selected}, path length=${config.zone.path.length}`);
          return selected;
        }).filter(config => {
          const hasPath = config.zone.path && config.zone.path.length > 0;
          console.log(`🔍 PATH DEBUG - ${config.key}: hasPath=${hasPath}, path="${config.zone.path}"`);
          return hasPath;
        })
        // Sort so hovered framework is rendered last (on top)
        .sort((a, b) => {
          if (hoveredFramework === a.key) return 1; // Move hovered to end (top layer)
          if (hoveredFramework === b.key) return -1; // Move non-hovered down
          return 0;
        })
        .map((config, index) => {
          
          return (
            <motion.g 
              key={config.key}
              onMouseEnter={() => setHoveredFramework(config.key)}
              onMouseLeave={() => setHoveredFramework(null)}
              style={{ 
                cursor: 'pointer',
                // CSS z-index won't work in SVG, but rendering order determines stacking
                position: 'relative'
              }}
            >
              {/* Base area with gradient - reduced opacity for better border visibility */}
              <motion.path
                d={config.zone.path}
                fill={`url(#${config.key}Gradient)`}
                stroke="none"
                fillOpacity={hoveredFramework === config.key ? "0.8" : "0.5"} // Reduced opacity so borders show through
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: hoveredFramework === null || hoveredFramework === config.key ? 1 : 0.3,
                  scale: hoveredFramework === config.key ? 1.08 : 1,
                }}
                transition={{ 
                  duration: hoveredFramework ? 0.2 : 0.8, 
                  delay: hoveredFramework ? 0 : index * 0.2, 
                  ease: "easeOut"
                }}
                style={{
                  transformOrigin: 'center',
                  mixBlendMode: 'multiply' // Changed to multiply for better transparency
                  // Removed shadow effects as requested
                }}
              />
              
              {/* Pattern overlay for print/screenshot distinguishability */}
              <motion.path
                d={config.zone.path}
                fill={`url(#${config.key}Pattern)`}
                stroke="none"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: hoveredFramework === null || hoveredFramework === config.key ? 0.6 : 0.3,
                }}
                transition={{ 
                  duration: hoveredFramework ? 0.2 : 0.8, 
                  delay: hoveredFramework ? 0 : index * 0.2 + 0.1, 
                }}
                style={{
                  transformOrigin: 'center',
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none'
                }}
              />
              
              {/* Enhanced visible border - always prominent */}
              <motion.path
                d={config.zone.path}
                fill="none"
                stroke={config.color}
                strokeWidth={hoveredFramework === config.key ? "6" : "4"} // Thicker borders for better visibility
                strokeOpacity={hoveredFramework === config.key ? "1" : "0.95"} // Even higher opacity for better visibility
                strokeDasharray={hoveredFramework === config.key ? "none" : "12,6"} // Even longer dashes for better visibility
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  strokeWidth: hoveredFramework === config.key ? 6 : 4,
                }}
                transition={{ 
                  duration: hoveredFramework ? 0.2 : 1.0, 
                  delay: hoveredFramework ? 0 : index * 0.1 + 0.5,
                  ease: "easeOut"
                }}
                style={{
                  transformOrigin: 'center',
                  // Removed shadow effects as requested
                  pointerEvents: 'none'
                }}
              />
              
              {/* White inner border for extra contrast */}
              <motion.path
                d={config.zone.path}
                fill="none"
                stroke="white"
                strokeWidth={hoveredFramework === config.key ? "3" : "2"}
                strokeOpacity={hoveredFramework === config.key ? "0.9" : "0.7"} // Higher opacity for better visibility
                strokeDasharray={hoveredFramework === config.key ? "none" : "6,3"} // Adjusted for thicker border
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  strokeWidth: hoveredFramework === config.key ? 3 : 2,
                }}
                transition={{ 
                  duration: hoveredFramework ? 0.2 : 1.1, 
                  delay: hoveredFramework ? 0 : index * 0.1 + 0.6,
                  ease: "easeOut"
                }}
                style={{
                  transformOrigin: 'center',
                  pointerEvents: 'none'
                }}
              />
              
            </motion.g>
          );
        })}


        {/* Separate label layer with dynamic z-index - ensures all framework labels are always visible on top */}
        {frameworkConfigs.filter(config => {
          const selected = isFrameworkSelected(config.key);
          return selected;
        }).filter(config => {
          const hasPath = config.zone.path && config.zone.path.length > 0;
          return hasPath;
        })
        // Sort so hovered framework label is rendered last (on top)
        .sort((a, b) => {
          if (hoveredFramework === a.key) return 1; // Move hovered to end (top layer)
          if (hoveredFramework === b.key) return -1; // Move non-hovered down
          return 0;
        })
        .map((config, index) => (
          <motion.g key={`label-${config.key}`}>
            {/* Label background for better readability */}
            <motion.rect
              x={(() => {
                const points = config.zone.points;
                const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
                // Enhanced offsets for better visibility - moved NIS2 up to avoid CIS Controls overlap
                const offsets = {
                  'iso27001': { x: -30, y: -90 },    // Much higher to avoid NIS2 overlap
                  'iso27002': { x: 90, y: -35 },     // Top-right, safe position
                  'cisControls': { x: 0, y: 50 },    // Bottom center, clear space
                  'gdpr': { x: 85, y: 15 },          // Right side away from Privacy corner
                  'nis2': { x: 60, y: 5 }            // Moved up to avoid CIS Controls overlap
                };
                const offset = offsets[config.key as keyof typeof offsets] || { x: 0, y: 0 };
                return avgX + offset.x - (config.name.length * 6); // Better centering with new width
              })()}
              y={(() => {
                const points = config.zone.points;
                const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
                const offsets = {
                  'iso27001': { x: -30, y: -90 },
                  'iso27002': { x: 90, y: -35 },
                  'cisControls': { x: 0, y: 50 },
                  'gdpr': { x: 85, y: 15 },
                  'nis2': { x: 60, y: 5 }
                };
                const offset = offsets[config.key as keyof typeof offsets] || { x: 0, y: 0 };
                return avgY + offset.y - 16; // Adjusted for taller label background
              })()}
              width={config.name.length * 12} // More width for better spacing
              height="32" // Taller for better text spacing
              rx="16" // Adjusted radius for new size
              fill={config.color}
              fillOpacity={hoveredFramework === config.key ? "0.98" : "0.92"} // Higher opacity for visibility
              stroke="white"
              strokeWidth="4" // Even thicker border for better text contrast
              style={{
                // Removed shadow effects as requested
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: hoveredFramework === null || hoveredFramework === config.key ? 1 : 0.6,
                scale: hoveredFramework === config.key ? 1.15 : 1, // Bigger hover effect
                y: hoveredFramework === config.key ? -5 : 0 // Float effect on hover
              }}
              transition={{ duration: hoveredFramework ? 0.2 : 0.6, delay: hoveredFramework ? 0 : index * 0.15 + 1.2 }}
            />
            
            {/* Framework name text - always on top */}
            <motion.text
              x={(() => {
                const points = config.zone.points;
                const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
                const offsets = {
                  'iso27001': { x: -30, y: -90 },
                  'iso27002': { x: 90, y: -35 },
                  'cisControls': { x: 0, y: 50 },
                  'gdpr': { x: 85, y: 15 },
                  'nis2': { x: 60, y: 5 }
                };
                const offset = offsets[config.key as keyof typeof offsets] || { x: 0, y: 0 };
                return avgX + offset.x;
              })()}
              y={(() => {
                const points = config.zone.points;
                const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
                const offsets = {
                  'iso27001': { x: -30, y: -90 },
                  'iso27002': { x: 90, y: -35 },
                  'cisControls': { x: 0, y: 50 },
                  'gdpr': { x: 85, y: 15 },
                  'nis2': { x: 60, y: 5 }
                };
                const offset = offsets[config.key as keyof typeof offsets] || { x: 0, y: 0 };
                return avgY + offset.y + 6; // Text centered in taller label
              })()}
              textAnchor="middle"
              className="text-sm font-bold fill-white"
              style={{
                pointerEvents: 'none',
                fontSize: '14px',
                fontWeight: '800',
                letterSpacing: '0.5px'
                // Removed shadow effects as requested
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: hoveredFramework === null || hoveredFramework === config.key ? 1 : 0.6,
                scale: hoveredFramework === config.key ? 1.15 : 1,
                y: hoveredFramework === config.key ? -5 : 0 // Float with background
              }}
              transition={{ duration: hoveredFramework ? 0.2 : 0.6, delay: hoveredFramework ? 0 : index * 0.15 + 1.3 }}
            >
              {config.name}
            </motion.text>
          </motion.g>
        ))}

        {/* AR Unified overlay - premium security coverage */}
        <motion.polygon
          points={unifiedZonePoints}
          fill={hoveredUnified ? "url(#unifiedHoverGradient)" : "url(#unifiedGradient)"}
          stroke="#4f46e5"
          strokeWidth={hoveredUnified ? "4" : "2"}
          strokeDasharray={hoveredUnified ? "0" : "20,8"}
          filter={hoveredUnified ? "url(#pentagonGlow)" : "none"}
          initial={{ opacity: 0, scale: 0.95, strokeOpacity: 0.6 }}
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

        {/* Ultra-premium AuditReady Unified center badge - respects hideLogo state */}
        {!hideLogo && (
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
        )}
      </svg>

      {/* Enhanced Interactive Legend */}
      <div className="mt-0">
        <div className="text-center mb-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">Selected Frameworks</h4>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
        {frameworkConfigs
          .filter(config => {
            // Only show legend for actually selected frameworks
            return isFrameworkSelected(config.key);
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
      
      {/* Hide Logo Button - Positioned below legend */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setHideLogo(!hideLogo)}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 border border-gray-300 dark:border-gray-600 shadow-sm"
          title="Hide/show AuditReady logo for documentation screenshots"
        >
          {hideLogo ? 'Show' : 'Hide'} AuditReady Logo
        </button>
      </div>
    </div>
  );
};