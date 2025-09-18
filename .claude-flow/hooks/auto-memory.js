#!/usr/bin/env node
/**
 * Auto-Memory Hook for Claude-Flow MCP
 * Automatically stores session context in persistent memory
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NAMESPACE = 'audit-ready';
const TTL = 7776000; // 90 days

// Memory keys to auto-update
const MEMORY_KEYS = {
  session_summary: 'session_' + new Date().toISOString().split('T')[0],
  latest_changes: 'latest_changes',
  critical_errors: 'critical_errors'
};

/**
 * Store memory entry
 */
async function storeMemory(key, value) {
  const command = `npx claude-flow memory store --key="${key}" --value="${value}" --namespace="${NAMESPACE}" --ttl=${TTL}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error storing memory: ${error}`);
        return reject(error);
      }
      console.log(`✅ Memory stored: ${key}`);
      resolve(stdout);
    });
  });
}

/**
 * Auto-capture session context
 */
async function captureSessionContext() {
  const context = {
    timestamp: new Date().toISOString(),
    project: 'AuditReady Hub',
    working_dir: process.cwd(),
    git_branch: await getGitBranch(),
    recent_files: await getRecentlyModifiedFiles()
  };
  
  return JSON.stringify(context);
}

/**
 * Get current git branch
 */
async function getGitBranch() {
  return new Promise((resolve) => {
    exec('git branch --show-current', (error, stdout) => {
      resolve(error ? 'unknown' : stdout.trim());
    });
  });
}

/**
 * Get recently modified files
 */
async function getRecentlyModifiedFiles() {
  return new Promise((resolve) => {
    exec('git diff --name-only HEAD~1', (error, stdout) => {
      resolve(error ? [] : stdout.split('\n').filter(f => f));
    });
  });
}

// Main execution
(async () => {
  console.log('🧠 Auto-Memory Hook Activated');
  
  try {
    // Capture and store session context
    const context = await captureSessionContext();
    await storeMemory(MEMORY_KEYS.session_summary, context);
    
    // Store any critical patterns from current session
    // This would be populated by Claude during the conversation
    if (process.env.CLAUDE_SESSION_SUMMARY) {
      await storeMemory('session_insights', process.env.CLAUDE_SESSION_SUMMARY);
    }
    
    console.log('✅ Memory auto-update complete');
  } catch (error) {
    console.error('❌ Memory update failed:', error);
  }
})();