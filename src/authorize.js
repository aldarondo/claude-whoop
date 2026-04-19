#!/usr/bin/env node
/**
 * One-time OAuth2 (PKCE) authorization flow for claude-whoop.
 * Starts a local HTTP server, opens the browser for authorization,
 * exchanges the code + verifier for tokens, writes them to .env.
 *
 * Usage: node src/authorize.js
 */

import http from 'http';
import crypto from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENV_PATH = join(ROOT, '.env');

const CLIENT_ID     = process.env.WHOOP_CLIENT_ID;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:8766/callback';
const PORT          = 8766;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: Set WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET in .env first.');
  process.exit(1);
}

// PKCE challenge
const codeVerifier  = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

const authUrl = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'offline read:recovery read:cycles read:sleep read:workout read:body_measurement');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('state', 'claude-whoop');

console.log('\nOpen this URL in your browser to authorize:');
console.log('\n' + authUrl.toString() + '\n');

try {
  const { execSync } = await import('child_process');
  const cmd = process.platform === 'win32' ? `start "${authUrl}"` : `open "${authUrl}"`;
  execSync(cmd, { stdio: 'ignore' });
} catch { /* ignore */ }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/callback') { res.end(); return; }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('No authorization code received.');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>Authorization complete — you can close this tab.</h2>');
  server.close();

  try {
    const { default: axios } = await import('axios');
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });
    const { data } = await axios.post(
      'https://api.prod.whoop.com/oauth/oauth2/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = data;
    const expires_at = Date.now() + expires_in * 1000;

    updateEnv({ access_token, refresh_token, expires_at });
    console.log('✅ Tokens saved to .env');
    console.log(`   Access token expires: ${new Date(expires_at).toISOString()}`);
  } catch (err) {
    console.error('Failed to exchange code:', err.response?.data ?? err.message);
    process.exit(1);
  }
});

server.listen(PORT, () => console.log(`Waiting for OAuth callback on port ${PORT}...`));

function updateEnv({ access_token, refresh_token, expires_at }) {
  let content = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : '';

  const set = (key, value) => {
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(content)) {
      content = content.replace(re, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  };

  set('WHOOP_ACCESS_TOKEN', access_token);
  set('WHOOP_REFRESH_TOKEN', refresh_token);
  set('WHOOP_TOKEN_EXPIRES_AT', String(expires_at));
  writeFileSync(ENV_PATH, content.trim() + '\n');
}
