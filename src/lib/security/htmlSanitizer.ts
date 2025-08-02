/**
 * HTML Sanitizer for rich text content
 * Prevents XSS attacks by allowing only safe HTML elements and attributes
 */

// Define allowed HTML tags
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote',
  'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'pre', 'code'
];

// Define allowed attributes for specific tags
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'span': ['style'],
  'div': ['style'],
  'p': ['style'],
  'h1': ['style'],
  'h2': ['style'],
  'h3': ['style'],
  'h4': ['style'],
  'h5': ['style'],
  'h6': ['style'],
  'td': ['colspan', 'rowspan'],
  'th': ['colspan', 'rowspan']
};

// Define allowed CSS properties
const ALLOWED_STYLES = [
  'color',
  'background-color',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-align',
  'margin',
  'padding',
  'font-size',
  'line-height'
];

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeRichText(html: string): string {
  // If no HTML, return empty string
  if (!html) return '';

  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Recursively clean all elements
  sanitizeElement(temp);

  return temp.innerHTML;
}

/**
 * Recursively sanitize a DOM element and its children
 */
function sanitizeElement(element: Element): void {
  // Get all child elements
  const children = Array.from(element.children);

  for (const child of children) {
    const tagName = child.tagName.toLowerCase();

    // Remove disallowed tags
    if (!ALLOWED_TAGS.includes(tagName)) {
      // Move children up to parent before removing the element
      while (child.firstChild) {
        element.insertBefore(child.firstChild, child);
      }
      child.remove();
      continue;
    }

    // Remove disallowed attributes
    const attributes = Array.from(child.attributes);
    for (const attr of attributes) {
      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
      
      if (!allowedAttrs.includes(attr.name)) {
        child.removeAttribute(attr.name);
      } else if (attr.name === 'style') {
        // Sanitize style attribute
        child.setAttribute('style', sanitizeStyles(attr.value));
      } else if (attr.name === 'href' && tagName === 'a') {
        // Sanitize URLs
        child.setAttribute('href', sanitizeUrl(attr.value));
      }
    }

    // Add rel="noopener noreferrer" to links with target="_blank"
    if (tagName === 'a' && child.getAttribute('target') === '_blank') {
      child.setAttribute('rel', 'noopener noreferrer');
    }

    // Recursively sanitize children
    sanitizeElement(child);
  }
}

/**
 * Sanitize CSS styles to only allow safe properties
 */
function sanitizeStyles(styleString: string): string {
  const styles = styleString.split(';').map(s => s.trim()).filter(Boolean);
  const sanitized: string[] = [];

  for (const style of styles) {
    const [property, value] = style.split(':').map(s => s.trim());
    
    if (property && value && ALLOWED_STYLES.includes(property)) {
      // Additional validation for specific properties
      if (property.includes('color') && !isValidColor(value)) {
        continue;
      }
      
      sanitized.push(`${property}: ${value}`);
    }
  }

  return sanitized.join('; ');
}

/**
 * Sanitize URLs to prevent javascript: and other dangerous protocols
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '#';
    }
  }

  return url;
}

/**
 * Validate CSS color values
 */
function isValidColor(color: string): boolean {
  // Allow hex colors
  if (/^#[0-9a-f]{3,6}$/i.test(color)) return true;
  
  // Allow rgb/rgba
  if (/^rgba?\([0-9, ]+\)$/i.test(color)) return true;
  
  // Allow named colors
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'gray', 'grey', 'orange', 'purple', 'brown', 'pink', 'lime', 'navy'
  ];
  
  return namedColors.includes(color.toLowerCase());
}

/**
 * Strip all HTML tags from content
 */
export function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Re-export SafeHTML component from the tsx file for convenience
export { SafeHTML } from './htmlSanitizer.tsx';