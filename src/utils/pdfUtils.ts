import { RefObject } from 'react';
import { toast } from './toast';

/**
 * Generate a PDF from a React component reference
 * This is a workaround for the browser's print functionality
 * It opens a new window, inserts the content, applies styles, and triggers print
 */
export const generatePDF = (
  contentRef: RefObject<HTMLElement>,
  title: string = 'Export',
  onFinish?: () => void
): void => {
  if (!contentRef.current) {
    toast.error('Failed to generate PDF: Content not found');
    if (onFinish) onFinish();
    return;
  }

  try {
    // Clone the content
    const content = contentRef.current.cloneNode(true) as HTMLElement;
    
    // Create a new window
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    
    if (!printWindow) {
      toast.error('Failed to open print window. Please check your popup blocker settings.');
      if (onFinish) onFinish();
      return;
    }
    
    // Set up the document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: portrait;
              margin: 20mm;
            }
            
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1f2937;
              line-height: 1.5;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              margin: 0;
              padding: 20px;
            }
            
            h1, h2, h3, h4 {
              margin-top: 0;
              font-weight: 600;
              color: #111827;
            }
            
            p {
              margin: 0 0 1rem;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            .no-break, .page-break-inside-avoid {
              page-break-inside: avoid;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
            }
            
            table, th, td {
              border: 1px solid #e5e7eb;
            }
            
            th, td {
              padding: 0.5rem;
              text-align: left;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            
            /* Status colors */
            .status-fulfilled, [data-status="fulfilled"] {
              background-color: #ecfdf5 !important;
              color: #065f46 !important;
              border-color: #10b981 !important;
            }
            
            .status-partially, .status-partially-fulfilled, [data-status="partially-fulfilled"] {
              background-color: #fffbeb !important;
              color: #92400e !important;
              border-color: #f59e0b !important;
            }
            
            .status-not-fulfilled, [data-status="not-fulfilled"] {
              background-color: #fef2f2 !important;
              color: #b91c1c !important;
              border-color: #ef4444 !important;
            }
            
            .status-not-applicable, [data-status="not-applicable"] {
              background-color: #f9fafb !important;
              color: #6b7280 !important;
              border-color: #9ca3af !important;
            }
            
            /* Hide UI elements not needed in print */
            button:not(.print-show), 
            .print-hide,
            .tabs-list,
            .collapsible-trigger {
              display: none !important;
            }
            
            /* Show hidden content in print */
            .collapsible-content {
              display: block !important;
              height: auto !important;
            }
            
            /* Badge and box styling */
            .rounded-md, .rounded {
              border-radius: 4px;
            }
            
            .print-only {
              display: block !important;
            }
            
            /* Fix for charts */
            .recharts-surface {
              overflow: visible !important;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
    
    // Add content to the body
    printWindow.document.body.appendChild(content);
    
    // Wait for all resources to load
    printWindow.document.close();
    
    // Handle both load conditions
    const loadHandler = () => {
      setTimeout(() => {
        try {
          printWindow.focus(); // Focus the window to ensure print dialog shows
          printWindow.print();
          
          // Close the window after printing (or when user cancels)
          printWindow.onafterprint = () => {
            printWindow.close();
            if (onFinish) {
              onFinish();
            }
            toast.success('PDF exported successfully');
          };
          
          // Fallback in case onafterprint is not supported
          setTimeout(() => {
            if (!printWindow.closed) {
              const closeButton = printWindow.document.createElement('button');
              closeButton.textContent = 'Close Window';
              closeButton.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;';
              closeButton.onclick = () => {
                printWindow.close();
                if (onFinish) {
                  onFinish();
                }
              };
              printWindow.document.body.appendChild(closeButton);
            }
          }, 2000);
        } catch (printError) {
          console.error('Error during print operation:', printError);
          toast.error('Print operation failed');
          if (onFinish) onFinish();
        }
      }, 500);
    };
    
    // Set up both load event handlers for cross-browser compatibility
    if (printWindow.document.readyState === 'complete') {
      loadHandler();
    } else {
      printWindow.onload = loadHandler;
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
    if (onFinish) onFinish();
  }
}; 