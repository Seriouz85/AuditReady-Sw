#!/usr/bin/env node

/**
 * Semantic Versioning Helper Script
 * Usage: node scripts/version.js [major|minor|patch] [--tag] [--push]
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagePath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

const args = process.argv.slice(2);
const versionType = args[0] || 'patch';
const shouldTag = args.includes('--tag');
const shouldPush = args.includes('--push');

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  default:
    console.error('Invalid version type. Use major, minor, or patch');
    process.exit(1);
}

// Update package.json
packageJson.version = newVersion;
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version bumped from ${packageJson.version} to ${newVersion}`);

// Create version file for build process
const versionInfo = {
  version: newVersion,
  buildDate: new Date().toISOString(),
  commitSha: execSync('git rev-parse HEAD').toString().trim(),
  branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
};

writeFileSync(
  join(__dirname, '..', 'src', 'version.json'),
  JSON.stringify(versionInfo, null, 2) + '\n'
);

// Git operations
try {
  execSync('git add package.json src/version.json');
  execSync(`git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`✅ Committed version ${newVersion}`);

  if (shouldTag) {
    execSync(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);
    console.log(`✅ Created tag v${newVersion}`);
  }

  if (shouldPush) {
    execSync('git push');
    if (shouldTag) {
      execSync('git push --tags');
    }
    console.log(`✅ Pushed to remote`);
  }
} catch (error) {
  console.error('❌ Git operations failed:', error.message);
  process.exit(1);
}

console.log(`
🎉 Version ${newVersion} is ready!

Next steps:
1. Run tests: npm test
2. Build: npm run build
3. Deploy to staging: npm run deploy:staging
4. Deploy to production: npm run deploy:prod
`);