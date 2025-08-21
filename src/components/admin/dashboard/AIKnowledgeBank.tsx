import { BookOpen, Shield, Scale, Database, Globe, FileSpreadsheet } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KnowledgeBankStandard {
  title: string;
  version: string;
  pages: string;
  icon: LucideIcon;
  description?: string;
}

interface AIKnowledgeBankProps {
  type: 'requirements' | 'guidance';
  className?: string;
}

const knowledgeBankStandards: KnowledgeBankStandard[] = [
  {
    title: 'ISO 27001/27002',
    version: '2022',
    pages: '203',
    icon: Shield,
    description: 'Information Security Management & Controls'
  },
  {
    title: 'CIS Controls',
    version: '8.1.2',
    pages: '190',
    icon: Scale,
    description: 'Cybersecurity Best Practices (IG1/IG2/IG3)'
  },
  {
    title: 'NIS2 Directive',
    version: '2022',
    pages: '89',
    icon: Globe,
    description: 'Network & Information Security'
  },
  {
    title: 'GDPR',
    version: '2018',
    pages: '261',
    icon: FileSpreadsheet,
    description: 'Data Protection Regulation'
  }
];

export function AIKnowledgeBank({ type, className = "" }: AIKnowledgeBankProps) {
  const getTitle = () => {
    return type === 'requirements' 
      ? 'AI Knowledge Bank'
      : 'AI Guidance Knowledge Bank';
  };

  const getSubtitle = () => {
    return type === 'requirements'
      ? 'Standards available for AI analysis'
      : 'Standards available for AI guidance enhancement';
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-10"></div>
      <div className="relative bg-black/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-2">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-3 h-3 text-purple-400" />
          <h4 className="text-xs font-bold text-white">AI Knowledge Bank</h4>
        </div>
        <div className="space-y-1">
          {knowledgeBankStandards.map(standard => {
            const IconComponent = standard.icon;
            return (
              <div 
                key={standard.title} 
                className="flex items-center justify-between p-1 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded border border-purple-500/10 hover:border-purple-400/30 transition-colors cursor-pointer"
                title={standard.description}
              >
                <div className="flex items-center gap-1">
                  <IconComponent className="w-2 h-2 text-purple-400" />
                  <div>
                    <div className="text-xs font-medium text-white">{standard.title}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-medium">{standard.pages}p</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}