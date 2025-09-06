import React from 'react';

type DocumentFormatterProps = {
  content: string;
};

const DocumentFormatter: React.FC<DocumentFormatterProps> = ({ content }) => {
  // Process the document content
  const formattedContent = React.useMemo(() => {
    // If no content, return empty array
    if (!content) return [];
    
    // Clean up any remaining asterisks that might be used for emphasis or bullets
    const cleanedContent = content
      .replace(/^\*\s/gm, '- ')        // Replace asterisk bullets at start of line with dashes
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown formatting
      .replace(/\*([^*]+)\*/g, '$1')      // Remove italic markdown formatting
      .replace(/\* /g, '- ')              // Replace any other asterisk bullets with dashes
    
         // Split content into sections by lines
    const lines = cleanedContent.split('\n');
    
    // Track the current section level for styling
    let currentSectionLevel = 0;
    
    // Track if we're in metadata section
    let inMetadata = false;
    
    // Process line by line
    const processedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but preserve spacing
      if (!trimmedLine) {
        return { type: 'empty', content: '', key: `empty-${index}` };
      }
      
      // Check for document title (usually the first non-empty line)
      if (index === lines.findIndex(l => l.trim())) {
        return { type: 'title', content: trimmedLine, key: `title-${index}` };
      }
      
      // Check for metadata section (version, date, etc.)
      if (trimmedLine.match(/^(Version|Date|Author|Document Owner|Status|Classification):/i)) {
        inMetadata = true;
        return { type: 'metadata', content: trimmedLine, key: `metadata-${index}` };
      }
      
      // End of metadata section
      if (inMetadata && (trimmedLine.endsWith(':') || trimmedLine.toUpperCase() === trimmedLine)) {
        inMetadata = false;
      }
      
      // Check for section headers
      if (trimmedLine.match(/^#+\s/) || trimmedLine.toUpperCase() === trimmedLine || trimmedLine.match(/^[0-9]+\.[0-9]*\s/)) {
        // Determine header level
        if (trimmedLine.match(/^#{6}\s/)) currentSectionLevel = 6;
        else if (trimmedLine.match(/^#{5}\s/)) currentSectionLevel = 5;
        else if (trimmedLine.match(/^#{4}\s/)) currentSectionLevel = 4;
        else if (trimmedLine.match(/^#{3}\s/)) currentSectionLevel = 3;
        else if (trimmedLine.match(/^#{2}\s/)) currentSectionLevel = 2;
        else if (trimmedLine.match(/^#{1}\s/)) currentSectionLevel = 1;
        else if (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 3) {
          currentSectionLevel = 2;
        } else if (trimmedLine.match(/^[0-9]+\.[0-9]*\s/)) {
          currentSectionLevel = 3;
        }
        
        // Clean the header text
        const headerText = trimmedLine.replace(/^#+\s/, '');
        
        return { 
          type: 'header', 
          level: currentSectionLevel, 
          content: headerText, 
          key: `header-${index}` 
        };
      }
      
      // Check for bullet points
      if (trimmedLine.match(/^[\*\-•]\s/)) {
        const bulletText = trimmedLine.replace(/^[\*\-•]\s/, '');
        return { type: 'bullet', content: bulletText, key: `bullet-${index}` };
      }
      
      // Check for numbered list
      if (trimmedLine.match(/^[0-9]+\.\s/)) {
        const listText = trimmedLine.replace(/^[0-9]+\.\s/, '');
        return { type: 'numbered', number: trimmedLine.match(/^[0-9]+/)?.[0] || '1', content: listText, key: `numbered-${index}` };
      }
      
      // Regular paragraph
      return { type: 'paragraph', content: trimmedLine, key: `para-${index}` };
    });
    
    return processedLines;
  }, [content]);
  
  // If no content, return empty div
  if (!content) return <div className="h-full w-full"></div>;

  return (
    <div className="document-preview font-sans text-foreground">
      {formattedContent.map((item) => {
        switch (item.type) {
          case 'title':
            return (
              <h1 
                key={item.key} 
                className="text-2xl font-bold mb-4 text-center border-b pb-4 pt-2 text-emerald-700 dark:text-emerald-400"
              >
                {item.content}
              </h1>
            );
            
          case 'metadata':
            return (
              <div 
                key={item.key} 
                className="text-sm mb-1.5 text-muted-foreground"
              >
                {item.content.split(':').map((part, i) => 
                  i === 0 ? <span key={i} className="font-medium">{part}:</span> : part
                )}
              </div>
            );
            
          case 'header':
            const headerClasses: Record<number, string> = {
              1: "text-xl font-bold mt-6 mb-3 text-emerald-700 dark:text-emerald-400 border-b pb-2",
              2: "text-lg font-bold mt-5 mb-3",
              3: "text-base font-bold mt-4 mb-2",
              4: "text-base font-semibold mt-3 mb-2",
              5: "text-sm font-semibold mt-3 mb-2",
              6: "text-sm font-medium mt-2 mb-2"
            };
            
            const headerClass = headerClasses[item.level as number] || "text-base font-bold mt-4 mb-2";
            
            return (
              <h2 
                key={item.key} 
                className={headerClass}
              >
                {item.content}
              </h2>
            );
            
          case 'bullet':
            return (
              <div key={item.key} className="flex items-start mb-2 pl-4">
                <span className="text-emerald-600 dark:text-emerald-400 mr-2">•</span>
                <span>{item.content}</span>
              </div>
            );
            
          case 'numbered':
            return (
              <div key={item.key} className="flex items-start mb-2 pl-4">
                <span className="text-emerald-600 dark:text-emerald-400 mr-2 min-w-[1.5rem]">{item.number}.</span>
                <span>{item.content}</span>
              </div>
            );
            
          case 'paragraph':
            return (
              <p key={item.key} className="mb-3 leading-relaxed">
                {item.content}
              </p>
            );
            
          case 'empty':
            return <div key={item.key} className="h-2"></div>;
            
          default:
            return null;
        }
      })}
    </div>
  );
};

export default DocumentFormatter; 