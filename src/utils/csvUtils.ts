/**
 * CSV Utility Functions
 * 
 * Provides secure and reliable CSV export functionality
 * with proper escaping and format handling.
 */

/**
 * Format a field value for CSV export
 * Handles quotes, commas, and newlines properly
 * 
 * @param text - The text to format for CSV
 * @returns Properly escaped CSV field
 */
export function formatCSVField(text: string | null | undefined): string {
  if (text == null) {
    return '""';
  }
  
  const stringValue = String(text);
  
  // If the field contains quotes, escape them by doubling
  // If the field contains commas, newlines, or quotes, wrap in quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return `"${stringValue}"`;
}

/**
 * Generate a clean filename for CSV export
 * 
 * @param baseName - Base name for the file
 * @param extension - File extension (without dot)
 * @returns Clean filename with timestamp
 */
export function generateCSVFilename(baseName: string, extension: string = 'csv'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const cleanName = baseName.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '-');
  return `${cleanName}-${timestamp}.${extension}`;
}

/**
 * Create CSV content from rows of data
 * 
 * @param headers - Array of header strings
 * @param rows - Array of row data (each row is an array of values)
 * @returns Complete CSV content string
 */
export function createCSVContent(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerRow = headers.map(header => formatCSVField(header)).join(',');
  const dataRows = rows.map(row => 
    row.map(cell => formatCSVField(String(cell ?? ''))).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV content as a file
 * Enhanced with BOM for better Excel/Google Sheets compatibility
 * 
 * @param content - CSV content string
 * @param filename - Name for the downloaded file
 */
export function downloadCSV(content: string, filename: string): void {
  // Add BOM (Byte Order Mark) for better Excel/Google Sheets UTF-8 support
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + content;
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

/**
 * Validate CSV data before export
 * 
 * @param headers - Array of header strings
 * @param rows - Array of row data
 * @returns Validation result with errors if any
 */
export function validateCSVData(
  headers: string[], 
  rows: (string | number | null | undefined)[][]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!headers || headers.length === 0) {
    errors.push('Headers are required for CSV export');
  }
  
  if (!rows || rows.length === 0) {
    errors.push('At least one data row is required for CSV export');
  }
  
  if (headers && rows) {
    const headerCount = headers.length;
    const invalidRows = rows.filter(row => row.length !== headerCount);
    
    if (invalidRows.length > 0) {
      errors.push(`${invalidRows.length} rows have mismatched column count (expected ${headerCount})`);
    }
  }
  
  // Check for potentially dangerous content
  const dangerousPrefixes = ['=', '+', '-', '@'];
  const dangerousHeaders = headers.filter(header => 
    dangerousPrefixes.some(prefix => String(header).trim().startsWith(prefix))
  );
  
  if (dangerousHeaders.length > 0) {
    errors.push(`Headers contain potentially dangerous formula prefixes: ${dangerousHeaders.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}