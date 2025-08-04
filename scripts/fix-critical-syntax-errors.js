#!/usr/bin/env node

/**
 * Critical Syntax Error Fix Script
 * 
 * This script fixes common syntax errors that prevent the app from loading:
 * 1. Malformed ternary operators with extra colons
 * 2. Broken string concatenations mixed with template literals
 * 3. Missing closing backticks or parentheses
 * 4. Malformed template string interpolations
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Patterns to fix
const patterns = [
  // Fix malformed ternary with extra colon - like: '?' expr ':' expr ': ' 
  {
    name: 'Extra colon in ternary',
    pattern: /(\?[^:]+:[^:]+): '/g,
    replacement: (match, p1) => p1 + " + '"
  },
  
  // Fix broken template literals mixed with concatenation like: + 'string${...}' 
  {
    name: 'Mixed string concatenation and template literal',
    pattern: /\+ '([^']*\$\{[^}]*\}[^']*)'`?/g,
    replacement: (match, p1) => ` + \`${p1}\``
  },
  
  // Fix broken query strings like: query ? '?${query)' : ''
  {
    name: 'Broken query string concatenation',
    pattern: /query \? '\?\$\{query\)\s*`?\s*:\s*['"]['"]?`?/g,
    replacement: "query ? `?${query}` : ''"
  },
  
  // Fix broken template string like: ${var ? 'text ${var2}` : ''}
  {
    name: 'Broken template string with backtick',
    pattern: /\$\{([^}]+\?[^}]*\$\{[^}]*\}[^}]*)`\s*:\s*['"]['"]?\}?/g,
    replacement: (match, p1) => `\${${p1}\` : ''}`
  },
  
  // Fix ternary operator with mixed string concat like: ? 'text'  + 'text'} 
  {
    name: 'Mixed ternary with string concatenation',
    pattern: /\?\s*'([^']*)'?\s*\+\s*'([^']*)'?\s*\}/g,
    replacement: (match, p1, p2) => ` ? '${p1}' : '${p2}'}`
  },
  
  // Fix concatenation like: '/path/' + id/action
  {
    name: 'Missing concatenation operator',
    pattern: /'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\/([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    replacement: "' + $1 + '/$2"
  },
  
  // Fix URL construction like: '/path/' + id${query...
  {
    name: 'URL with broken template interpolation',
    pattern: /'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\$\{([^}]+)\}\s*`?\s*:\s*['"]['"]?/g,
    replacement: (match, p1, p2) => `\` + ${p1}\${${p2}} : ''}`
  },
  
  // Fix string like: 'text' + var + 'more${template}` : ''
  {
    name: 'Complex broken string concatenation',
    pattern: /'([^']*)'?\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+?\s*'([^']*\$\{[^}]*\}[^']*)'?\s*`?\s*:\s*['"]['"]?/g,
    replacement: (match, p1, p2, p3) => `\`${p1}\${${p2}}${p3}\``
  },
  
  // Fix double backtick at end like: template}`;
  {
    name: 'Double backtick at end',
    pattern: /\}`;$/gm,
    replacement: '}`'
  },
  
  // Fix broken method call like: )}`, 'POST'
  {
    name: 'Broken method call with backtick',
    pattern: /\)\);\}\s*`\s*,\s*['"]([^'"]*)['"]/g,
    replacement: "), '$1'"
  },
  
  // Fix specific pattern: (variable));}/text`, 'METHOD'
  {
    name: 'Specific broken method pattern',
    pattern: /\([^)]+\)\);\}\s*`\s*,\s*['"]([^'"]*)['"]/g,
    replacement: (match, method) => `, '${method}'`
  },
  
  // Fix hours string like: (hours) + 'h${...}m` : ''}`
  {
    name: 'Broken duration formatting',
    pattern: /\(hours\)\s*\+\s*'h\$\{([^}]+)\}m`\s*:\s*['"]['"]?\}?`?/g,
    replacement: (match, p1) => `\`\${hours}h\${${p1}}m\``
  },
  
  // Fix alert count like: 'Found ' + count alerts${...} critical` : ''
  {
    name: 'Broken alert count string',
    pattern: /'Found '\s*\+\s*([^}]+)\s+alerts\$\{([^}]+)\}\s*critical`\s*:\s*['"]['"]?\}?`?/g,
    replacement: (match, p1, p2) => `\`Found \${${p1}} alerts\${${p2}} critical\``
  },
  
  // Fix logger message like: 'Database ' + operation${table...
  {
    name: 'Broken logger message',
    pattern: /'([^']*)'?\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\$\{([^}]+)\}\s*`?\s*:\s*['"]['"]?/g,
    replacement: (match, p1, p2, p3) => `\`${p1}\${${p2}}\${${p3}}\``
  }
];

// Additional specific file fixes
const specificFixes = {
  'EnhancedCourseCard.tsx': [
    {
      pattern: /return\s*\(hours\)\s*\+\s*'h\$\{remainingMinutes\s*>\s*0\s*\?\s*'\s*\$\{remainingMinutes\}m`\s*:\s*['"]['"]?\}?`?;?/g,
      replacement: "return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;"
    }
  ],
  'logger.ts': [
    {
      pattern: /const message = 'Database '\s*\+\s*operation\$\{table\s*\?\s*'\s*on\s*\$\{table\}`\s*:\s*['"]['"]?\}?`?;?/g,
      replacement: "const message = `Database ${operation}${table ? ` on ${table}` : ''}`;"
    }
  ],
  'anomalyDetection.ts': [
    {
      pattern: /'Compliance score dropped by '\s*\+\s*\([^)]+\)\s*\+\s*'%\s*\$\{framework\s*\?\s*'for\s*\$\{framework\}`\s*:\s*'overall'\}\.`/g,
      replacement: "`Compliance score dropped by ${scoreDrop.toFixed(1)}% ${framework ? `for ${framework}` : 'overall'}.`"
    }
  ]
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const fileName = path.basename(filePath);
    
    // Apply general patterns
    patterns.forEach(({ name, pattern, replacement }) => {
      if (pattern.test(content)) {
        log(`  Applying: ${name}`, 'yellow');
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    });
    
    // Apply specific file fixes
    Object.keys(specificFixes).forEach(filePattern => {
      if (fileName.includes(filePattern)) {
        specificFixes[filePattern].forEach(({ pattern, replacement }) => {
          if (pattern.test(content)) {
            log(`  Applying specific fix for ${filePattern}`, 'cyan');
            content = content.replace(pattern, replacement);
            hasChanges = true;
          }
        });
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      log(`✓ Fixed: ${filePath}`, 'green');
      return true;
    }
    
    return false;
  } catch (error) {
    log(`✗ Error fixing ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🔧 Starting Critical Syntax Error Fix...', 'blue');
  
  // Find all TypeScript and TSX files
  const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
  });
  
  log(`Found ${files.length} files to check`, 'cyan');
  
  let fixedFiles = 0;
  
  files.forEach(file => {
    if (fixFile(file)) {
      fixedFiles++;
    }
  });
  
  log(`\n🎉 Completed! Fixed ${fixedFiles} files`, 'green');
  
  if (fixedFiles > 0) {
    log('\n📝 Next steps:', 'blue');
    log('1. Check if the app loads without syntax errors', 'cyan');
    log('2. Run TypeScript compiler to check for type errors', 'cyan');
    log('3. Test critical functionality', 'cyan');
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixFile, patterns, specificFixes };