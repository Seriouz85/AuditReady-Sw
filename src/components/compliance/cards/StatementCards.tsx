/**
 * Problem and Solution Statement Cards
 * Extracted from ComplianceSimplification.tsx repeated patterns
 * CRITICAL: Preserves EXACT visual styling, gradients, and content
 */

import React from 'react';
import { CardContent, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Target, Zap, Shield } from 'lucide-react';
import { 
  StandardCard, 
  ProblemStatementHeader, 
  SolutionStatementHeader,
  IconGradientContainer,
  ColoredInfoBox
} from '../shared/UnifiedStyledComponents';

/**
 * Problem Statement Card - EXACT preservation of red/orange/amber gradient
 */
export function ProblemStatementCard() {
  return (
    <StandardCard>
      <ProblemStatementHeader>
        <div className="flex items-center space-x-3">
          <IconGradientContainer 
            gradient="from-red-500 to-orange-600"
            shadowColor="shadow-red-500/20"
          >
            <AlertTriangle className="h-6 w-6 text-white" />
          </IconGradientContainer>
          <CardTitle className="text-xl font-bold text-red-800 dark:text-red-200">
            Problem Statement
          </CardTitle>
        </div>
      </ProblemStatementHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Organizations struggle to navigate the complex landscape of cybersecurity compliance frameworks. 
            With overlapping requirements across <strong>ISO 27001</strong>, <strong>NIS2 Directive</strong>, 
            <strong>CIS Controls</strong>, and <strong>NIST Framework</strong>, teams waste valuable time 
            mapping dependencies and identifying unified implementation strategies.
          </p>
          
          <ColoredInfoBox bgColor="bg-red-100 dark:bg-red-900/30">
            <div className="text-center">
              <p className="text-red-800 dark:text-red-200 font-semibold text-sm">
                Result: <span className="font-bold">Fragmented compliance efforts</span>, 
                increased costs, and security gaps
              </p>
            </div>
          </ColoredInfoBox>
        </div>
      </CardContent>
    </StandardCard>
  );
}

/**
 * Solution Statement Card - EXACT preservation of green/emerald/blue gradient
 */
export function SolutionStatementCard() {
  return (
    <StandardCard>
      <SolutionStatementHeader>
        <div className="flex items-center space-x-3">
          <IconGradientContainer 
            gradient="from-green-500 to-emerald-600"
            shadowColor="shadow-green-500/20"
          >
            <CheckCircle className="h-6 w-6 text-white" />
          </IconGradientContainer>
          <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200">
            Unified Solution
          </CardTitle>
        </div>
      </SolutionStatementHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Our AI-powered compliance simplification engine automatically maps relationships 
            between frameworks, identifies unified requirements, and generates streamlined 
            implementation guidance. Transform scattered compliance efforts into a 
            <strong> single, coherent strategy</strong>.
          </p>
          
          <ColoredInfoBox bgColor="bg-green-100 dark:bg-green-900/30">
            <div className="text-center">
              <p className="text-green-800 dark:text-green-200 font-semibold text-sm">
                Result: <span className="font-bold">Unified compliance strategy</span>, 
                reduced implementation time, and comprehensive coverage
              </p>
            </div>
          </ColoredInfoBox>
        </div>
      </CardContent>
    </StandardCard>
  );
}

/**
 * Feature Benefits Card - EXACT preservation of styling patterns
 */
export function FeatureBenefitsCard() {
  const benefits = [
    {
      icon: Target,
      title: "Unified Requirements",
      description: "Automatically map overlapping requirements across all frameworks",
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/20"
    },
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Generate intelligent guidance using advanced AI models",
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "shadow-purple-500/20"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Maintain highest security standards throughout the process",
      gradient: "from-green-500 to-emerald-600",
      shadowColor: "shadow-green-500/20"
    }
  ];

  return (
    <StandardCard>
      <SolutionStatementHeader>
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Key Benefits
        </CardTitle>
      </SolutionStatementHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="flex justify-center">
                <IconGradientContainer 
                  gradient={benefit.gradient}
                  shadowColor={benefit.shadowColor}
                >
                  <benefit.icon className="h-6 w-6 text-white" />
                </IconGradientContainer>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                {benefit.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </StandardCard>
  );
}

/**
 * Getting Started Card - EXACT preservation
 */
export function GettingStartedCard() {
  return (
    <StandardCard>
      <SolutionStatementHeader>
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Getting Started
        </CardTitle>
      </SolutionStatementHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Select Frameworks
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                Choose the compliance frameworks relevant to your organization
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Generate Requirements
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                Our AI analyzes and unifies requirements across all selected frameworks
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Review Guidance
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                Access detailed implementation guidance for each unified requirement
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Export & Implement
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                Export your unified compliance strategy in multiple formats
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </StandardCard>
  );
}