import React from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

/**
 * Handle bold markdown formatting (**text**)
 */
const processBoldFormatting = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  
  return parts.map((part, partIndex) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={partIndex} className="font-semibold">{boldText}</strong>;
    }
    return part;
  });
};

/**
 * Format bullet points to ensure they appear on their own lines
 */
const formatBulletPoints = (text: string): React.ReactNode => {
  if (!text.includes('•')) return processBoldFormatting(text);
  
  const parts = text.split('•');
  const firstPart = parts[0];
  const bulletParts = parts.slice(1);
  
  return (
    <>
      {processBoldFormatting(firstPart)}
      {bulletParts.map((part, index) => (
        <React.Fragment key={index}>
          <br />
          <span>• {processBoldFormatting(part.trim())}</span>
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Simple markdown renderer that preserves specific bold formatting patterns
 * Specifically handles subsection titles and Framework References
 */
export function MarkdownText({ text, className = '' }: MarkdownTextProps) {
  if (!text) return null;
  
  

  // Convert text to HTML with bold formatting for specific patterns
  const renderMarkdown = (input: string): React.ReactNode => {
    // Split by line breaks to preserve paragraph structure
    const lines = input.split('\n');
    
    return lines.map((line, index) => {
      if (!line.trim()) {
        return <br key={index} />;
      }
      

      // Check for specific titles that should be bold
      if (line.match(/^i\)\s+COMPETENCE/i)) {
        console.log('🟢 FOUND i) COMPETENCE LINE:', line);
        const parts = line.split(' - ');
        const title = parts[0];
        const description = parts.slice(1).join(' - ');
        return (
          <React.Fragment key={index}>
            <strong className="font-semibold">{title}</strong>
            {description && ` - ${description}`}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      if (line.match(/^n\)\s+THIRD/i)) {
        console.log('🟢 FOUND n) THIRD LINE:', line);
        const parts = line.split(' - ');
        const title = parts[0];
        const description = parts.slice(1).join(' - ');
        return (
          <React.Fragment key={index}>
            <strong className="font-semibold">{title}</strong>
            {description && ` - ${description}`}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      if (line.match(/^h\)\s+PERSONNEL SECURITY FRAMEWORK/i)) {
        const parts = line.split(' - ');
        const title = parts[0];
        const description = parts.slice(1).join(' - ');
        return (
          <React.Fragment key={index}>
            <strong className="font-semibold">{title}</strong>
            {description && ` - ${description}`}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }

      // Check if line starts with a letter pattern like "a) **Title**" or "a) Title:"
      // Handle both bold titles with dash separator and regular titles with colon
      const boldLetterMatch = line.match(/^([a-z]\))\s+\*\*([^*]+)\*\*\s*-?\s*(.*)$/i);
      const regularLetterMatch = line.match(/^([a-z]\))\s+([^:]+):\s*(.*)$/i);
      
      const letterMatch = boldLetterMatch || regularLetterMatch;
      if (letterMatch) {
        const [, letter, title, description] = letterMatch;
        
        // Check if description contains Framework References and format it
        if (description.includes('Framework References:')) {
          const parts = description.split('Framework References:');
          const beforeFramework = parts[0].trim();
          const afterFramework = parts[1];
          
          return (
            <React.Fragment key={index}>
              <strong className="font-semibold">{letter} {title}:</strong> {formatBulletPoints(beforeFramework)}
              <br />
              <strong className="font-semibold text-blue-400">Framework References:</strong>
              {afterFramework && <span>{afterFramework}</span>}
              {index < lines.length - 1 && <br />}
            </React.Fragment>
          );
        }
        
        // Regular letter pattern without Framework References
        return (
          <React.Fragment key={index}>
            <strong className="font-semibold">{letter} {title}:</strong> {formatBulletPoints(description)}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }

      // Check if line contains "Framework References:" (with or without asterisks)
      if (line.includes('Framework References:') || line.includes('**Framework References:**')) {
        // Handle both "Framework References:" and "**Framework References:**"
        const searchTerm = line.includes('**Framework References:**') ? '**Framework References:**' : 'Framework References:';
        const parts = line.split(searchTerm);
        
        // Split before and after Framework References
        const beforeText = parts[0];
        const afterText = parts[1];
        
        return (
          <React.Fragment key={index}>
            {beforeText && (
              <>
                {beforeText.trim()}
                <br />
              </>
            )}
            <strong className="font-semibold text-blue-400">Framework References:</strong>
            {afterText && <span>{afterText}</span>}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }

      // Regular line with bold formatting
      return (
        <React.Fragment key={index}>
          {processBoldFormatting(line)}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <span className={className}>
      {renderMarkdown(text)}
    </span>
  );
}