#!/usr/bin/env node

/**
 * MCP Client for Claude Code Integration
 * Connects Claude Code to the Audit Hub MCP Server
 */

const WebSocket = require('ws');
const { spawn } = require('child_process');

class MCPClient {
  constructor() {
    this.serverUrl = process.env.MCP_SERVER_URL || 'ws://localhost:3001';
    this.ws = null;
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
  }

  connect() {
    console.log(`Connecting to MCP Server at ${this.serverUrl}...`);
    
    this.ws = new WebSocket(this.serverUrl);

    this.ws.on('open', () => {
      console.log('✅ Connected to Audit Hub MCP Server');
      this.reconnectAttempts = 0;
      
      // Send initial handshake
      this.send({
        type: 'handshake',
        client: 'claude-code',
        version: '1.0.0',
        capabilities: [
          'file-operations',
          'command-execution',
          'real-time-updates'
        ]
      });
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('🔌 Disconnected from MCP Server');
      this.attemptReconnect();
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  handleMessage(message) {
    const { type, payload } = message;

    switch (type) {
      case 'welcome':
        console.log('🎉 MCP Server capabilities:', message.capabilities);
        break;

      case 'file-change':
        console.log(`📝 File changed: ${message.path}`);
        break;

      case 'file-add':
        console.log(`➕ File added: ${message.path}`);
        break;

      case 'file-delete':
        console.log(`🗑️  File deleted: ${message.path}`);
        break;

      case 'command-result':
        console.log('✅ Command executed successfully');
        if (payload && payload.stdout) {
          console.log(payload.stdout);
        }
        break;

      case 'command-error':
        console.error('❌ Command failed:', message.error);
        break;

      case 'pong':
        // Handle ping/pong for keepalive
        break;

      default:
        console.log('📨 Received message:', message);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  // Send a ping to keep connection alive
  ping() {
    this.send({ type: 'ping' });
  }

  // Execute a command through the MCP server
  executeCommand(command) {
    this.send({
      type: 'execute-command',
      payload: {
        command,
        requestId: Date.now().toString()
      }
    });
  }

  // Subscribe to file changes
  subscribeToChanges() {
    this.send({
      type: 'subscribe-changes'
    });
  }

  start() {
    this.connect();
    
    // Subscribe to file changes
    setTimeout(() => {
      this.subscribeToChanges();
    }, 1000);

    // Keep connection alive with periodic pings
    setInterval(() => {
      this.ping();
    }, 30000);

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down MCP client...');
      if (this.ws) {
        this.ws.close();
      }
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      if (this.ws) {
        this.ws.close();
      }
      process.exit(0);
    });
  }
}

// Start the MCP client
const client = new MCPClient();
client.start();

// Export for potential programmatic use
module.exports = MCPClient;