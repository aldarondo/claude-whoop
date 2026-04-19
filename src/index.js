#!/usr/bin/env node
/**
 * claude-whoop MCP Server — stdio entry point.
 * Pulls recovery, sleep, workouts, and strain data from the Whoop API.
 *
 * Env vars required:
 *   WHOOP_CLIENT_ID       - OAuth2 app client ID
 *   WHOOP_CLIENT_SECRET   - OAuth2 app client secret
 *   WHOOP_ACCESS_TOKEN    - Current access token
 *   WHOOP_REFRESH_TOKEN   - Refresh token (auto-rotated)
 *   WHOOP_TOKEN_EXPIRES_AT - Unix ms timestamp of expiry
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('claude-whoop MCP server running');
