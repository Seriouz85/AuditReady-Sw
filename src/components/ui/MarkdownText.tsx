import React from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

/**
 * Format bullet points to ensure they appear on their own lines
 */
const formatBulletPoints = (text: string): React.ReactNode => {
  if (!text.includes('•')) return text;
  
  const parts = text.split('•');
  const firstPart = parts[0];
  const bulletParts = parts.slice(1);
  
  return (
    <>
      {firstPart}
      {bulletParts.map((part, index) => (
        <React.Fragment key={index}>
          <br />
          <span>• {part.trim()}</span>
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
      

      // Check if line starts with a letter pattern like "a) Title:"
      const letterMatch = line.match(/^([a-z]\))\s+([^:]+):\s*(.*)$/i);
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

      // Regular line
      return (
        <React.Fragment key={index}>
          {line}
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