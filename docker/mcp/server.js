#!/usr/bin/env node

/**
 * Enhanced MCP Server for Audit Readiness Hub
 * Provides advanced AI development assistance capabilities
 */

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { createServer } = require('http');
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const chokidar = require('chokidar');
const Redis = require('ioredis');
const { Client } = require('pg');
require('dotenv').config();

class AuditHubMCPServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.port = process.env.MCP_SERVER_PORT || 3001;
    this.workspacePath = process.env.WORKSPACE_PATH || '/workspace';
    this.clients = new Set();
    this.fileWatcher = null;
    this.redis = null;
    this.postgres = null;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupServices();
    this.setupFileWatcher();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        workspace: this.workspacePath,
        services: {
          redis: this.redis?.status || 'disconnected',
          postgres: this.postgres?._connected || false,
          fileWatcher: !!this.fileWatcher
        }
      });
    });

    // Workspace operations
    this.app.get('/workspace/structure', async (req, res) => {
      try {
        const structure = await this.getWorkspaceStructure();
        res.json(structure);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/workspace/analyze', async (req, res) => {
      try {
        const { path: targetPath, deep = false } = req.body;
        const analysis = await this.analyzeCode(targetPath, deep);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Docker operations
    this.app.get('/docker/containers', async (req, res) => {
      try {
        const containers = await this.getDockerContainers();
        res.json(containers);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/docker/compose', async (req, res) => {
      try {
        const { action, service } = req.body;
        const result = await this.dockerComposeAction(action, service);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Development tools
    this.app.post('/tools/lint', async (req, res) => {
      try {
        const { files } = req.body;
        const results = await this.runLinting(files);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/tools/test', async (req, res) => {
      try {
        const { pattern, watch = false } = req.body;
        const results = await this.runTests(pattern, watch);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Database operations
    this.app.post('/database/query', async (req, res) => {
      try {
        const { query, params = [] } = req.body;
        const results = await this.executeQuery(query, params);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/database/schema', async (req, res) => {
      try {
        const schema = await this.getDatabaseSchema();
        res.json(schema);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // AI assistance endpoints
    this.app.post('/ai/code-review', async (req, res) => {
      try {
        const { files, context } = req.body;
        const review = await this.performCodeReview(files, context);
        res.json(review);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/ai/generate-tests', async (req, res) => {
      try {
        const { sourceFile, testType = 'unit' } = req.body;
        const tests = await this.generateTests(sourceFile, testType);
        res.json(tests);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          ws.send(JSON.stringify({ error: error.message }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Audit Hub MCP Server',
        capabilities: [
          'file-watching',
          'code-analysis',
          'docker-management',
          'database-operations',
          'ai-assistance'
        ]
      }));
    });
  }

  async setupServices() {
    // Redis connection
    try {
      this.redis = new Redis({
        host: 'redis',
        port: 6379,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      });
      console.log('Connected to Redis');
    } catch (error) {
      console.warn('Redis connection failed:', error.message);
    }

    // PostgreSQL connection (if using local postgres)
    try {
      this.postgres = new Client({
        host: 'postgres-local',
        port: 5432,
        database: 'audit_readiness_hub_dev',
        user: 'postgres',
        password: 'postgres'
      });
      await this.postgres.connect();
      console.log('Connected to PostgreSQL');
    } catch (error) {
      console.warn('PostgreSQL connection failed:', error.message);
    }
  }

  setupFileWatcher() {
    // Watch workspace for changes
    this.fileWatcher = chokidar.watch(this.workspacePath, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**'
      ],
      persistent: true,
      ignoreInitial: true
    });

    this.fileWatcher.on('change', (filePath) => {
      this.broadcastToClients({
        type: 'file-change',
        path: filePath,
        timestamp: new Date().toISOString()
      });
    });

    this.fileWatcher.on('add', (filePath) => {
      this.broadcastToClients({
        type: 'file-add',
        path: filePath,
        timestamp: new Date().toISOString()
      });
    });

    this.fileWatcher.on('unlink', (filePath) => {
      this.broadcastToClients({
        type: 'file-delete',
        path: filePath,
        timestamp: new Date().toISOString()
      });
    });
  }

  async getWorkspaceStructure() {
    const structure = {};
    
    async function buildStructure(dir, obj) {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          if (!item.startsWith('.') && !['node_modules', 'dist', 'build'].includes(item)) {
            obj[item] = {};
            await buildStructure(fullPath, obj[item]);
          }
        } else {
          obj[item] = {
            size: stat.size,
            modified: stat.mtime.toISOString(),
            type: path.extname(item)
          };
        }
      }
    }
    
    await buildStructure(this.workspacePath, structure);
    return structure;
  }

  async analyzeCode(targetPath, deep = false) {
    const fullPath = path.join(this.workspacePath, targetPath);
    const analysis = {
      path: targetPath,
      timestamp: new Date().toISOString(),
      metrics: {},
      issues: [],
      suggestions: []
    };

    try {
      const stat = await fs.stat(fullPath);
      
      if (stat.isFile()) {
        const content = await fs.readFile(fullPath, 'utf8');
        analysis.metrics = {
          lines: content.split('\n').length,
          size: stat.size,
          lastModified: stat.mtime.toISOString()
        };

        // Basic code analysis
        if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
          analysis.metrics.functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
          analysis.metrics.components = (content.match(/(?:export\s+)?(?:default\s+)?(?:function|const)\s+[A-Z]\w*/g) || []).length;
          analysis.metrics.imports = (content.match(/import\s+.*from/g) || []).length;
          
          // Check for potential issues
          if (content.includes('console.log')) {
            analysis.issues.push('Contains console.log statements');
          }
          if (content.includes('// TODO')) {
            analysis.issues.push('Contains TODO comments');
          }
          if (content.length > 10000) {
            analysis.suggestions.push('Consider splitting large file into smaller modules');
          }
        }
      }
    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }

  async getDockerContainers() {
    return new Promise((resolve, reject) => {
      exec('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        
        const lines = stdout.trim().split('\n');
        const containers = lines.slice(1).map(line => {
          const [name, status, ports] = line.split('\t');
          return { name, status, ports };
        });
        
        resolve(containers);
      });
    });
  }

  async dockerComposeAction(action, service = '') {
    const validActions = ['up', 'down', 'restart', 'logs', 'ps'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}`);
    }

    const command = service 
      ? `docker compose ${action} ${service}`
      : `docker compose ${action}`;

    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.workspacePath }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve({ stdout, stderr });
      });
    });
  }

  async runLinting(files = []) {
    const results = {};
    
    for (const file of files) {
      const fullPath = path.join(this.workspacePath, file);
      
      try {
        if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
          const { stdout, stderr } = await this.execCommand(`npx eslint ${fullPath}`);
          results[file] = { stdout, stderr, type: 'eslint' };
        }
      } catch (error) {
        results[file] = { error: error.message };
      }
    }
    
    return results;
  }

  async runTests(pattern = '', watch = false) {
    const command = watch 
      ? `npm run test:watch ${pattern}`
      : `npm test ${pattern}`;

    try {
      const { stdout, stderr } = await this.execCommand(command);
      return { stdout, stderr, success: true };
    } catch (error) {
      return { error: error.message, success: false };
    }
  }

  async executeQuery(query, params = []) {
    if (!this.postgres) {
      throw new Error('PostgreSQL connection not available');
    }

    try {
      const result = await this.postgres.query(query, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        command: result.command
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  async getDatabaseSchema() {
    if (!this.postgres) {
      throw new Error('PostgreSQL connection not available');
    }

    const query = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    try {
      const result = await this.postgres.query(query);
      const schema = {};
      
      result.rows.forEach(row => {
        if (!schema[row.table_name]) {
          schema[row.table_name] = [];
        }
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES'
        });
      });
      
      return schema;
    } catch (error) {
      throw new Error(`Schema retrieval failed: ${error.message}`);
    }
  }

  async performCodeReview(files, context = '') {
    // This would integrate with AI services for code review
    // For now, return a basic analysis
    const review = {
      timestamp: new Date().toISOString(),
      context,
      files: [],
      summary: {
        issues: 0,
        suggestions: 0,
        score: 0
      }
    };

    for (const file of files) {
      const analysis = await this.analyzeCode(file, true);
      review.files.push(analysis);
      review.summary.issues += analysis.issues.length;
      review.summary.suggestions += analysis.suggestions.length;
    }

    review.summary.score = Math.max(0, 100 - (review.summary.issues * 10) - (review.summary.suggestions * 5));
    
    return review;
  }

  async generateTests(sourceFile, testType = 'unit') {
    const fullPath = path.join(this.workspacePath, sourceFile);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Basic test generation (would be enhanced with AI)
      const testTemplate = `
import { describe, it, expect } from 'vitest';
import { ${path.basename(sourceFile, path.extname(sourceFile))} } from '${sourceFile}';

describe('${path.basename(sourceFile)}', () => {
  it('should be defined', () => {
    expect(${path.basename(sourceFile, path.extname(sourceFile))}).toBeDefined();
  });

  // TODO: Add more specific tests based on the source code
});
`;

      return {
        sourceFile,
        testType,
        generatedTest: testTemplate,
        suggestions: [
          'Add tests for all exported functions',
          'Include edge cases and error scenarios',
          'Add integration tests if applicable'
        ]
      };
    } catch (error) {
      throw new Error(`Test generation failed: ${error.message}`);
    }
  }

  async handleWebSocketMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
        
      case 'subscribe-changes':
        // Client is subscribing to file changes
        ws.send(JSON.stringify({ 
          type: 'subscribed', 
          message: 'Subscribed to file changes' 
        }));
        break;
        
      case 'execute-command':
        try {
          const result = await this.execCommand(payload.command);
          ws.send(JSON.stringify({ 
            type: 'command-result', 
            result,
            requestId: payload.requestId 
          }));
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'command-error', 
            error: error.message,
            requestId: payload.requestId 
          }));
        }
        break;
        
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: `Unknown message type: ${type}` 
        }));
    }
  }

  broadcastToClients(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.workspacePath }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve({ stdout, stderr });
      });
    });
  }

  async start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 Audit Hub MCP Server running on port ${this.port}`);
      console.log(`📁 Workspace: ${this.workspacePath}`);
      console.log(`🔗 WebSocket endpoint: ws://localhost:${this.port}`);
      console.log(`🩺 Health check: http://localhost:${this.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Shutting down MCP server...');
      if (this.fileWatcher) this.fileWatcher.close();
      if (this.redis) this.redis.disconnect();
      if (this.postgres) await this.postgres.end();
      process.exit(0);
    });
  }
}

// Start the server
const server = new AuditHubMCPServer();
server.start().catch(console.error);