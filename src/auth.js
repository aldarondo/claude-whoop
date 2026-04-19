/**
 * Whoop OAuth2 token management.
 * Docs: https://developer.whoop.com/api#section/Authentication
 */

import axios from 'axios';

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

export async function getAccessToken() {
  const expiresAt = parseInt(process.env.WHOOP_TOKEN_EXPIRES_AT || '0', 10);
  if (Date.now() < expiresAt - 300_000) {
    return process.env.WHOOP_ACCESS_TOKEN;
  }
  return refreshAccessToken();
}

export async function refreshAccessToken() {
  const clientId     = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const refreshToken = process.env.WHOOP_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, and WHOOP_REFRESH_TOKEN must be set');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    scope: 'offline read:recovery read:cycles read:sleep read:workout read:body_measurement',
  });

  const { data } = await axios.post(TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  process.env.WHOOP_ACCESS_TOKEN    = data.access_token;
  process.env.WHOOP_REFRESH_TOKEN   = data.refresh_token;
  process.env.WHOOP_TOKEN_EXPIRES_AT = String(Date.now() + data.expires_in * 1000);

  return data.access_token;
}
