const GITHUB_API = 'https://api.github.com';

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin === '*' ? '*' : (origin === allowedOrigin ? origin : allowedOrigin),
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function response(request, env, body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { ...corsHeaders(request, env), ...headers } });
}

function githubHeaders(env) {
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'User-Agent': 'meyers-family-events-state-worker',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function repositoryConfig(env) {
  const [owner, repository, extra] = (env.GITHUB_REPOSITORY || '').split('/');
  if (!owner || !repository || extra || !env.GITHUB_TOKEN) {
    throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN must be configured.');
  }
  const path = (env.GITHUB_STATE_PATH || 'data/app-state.json').split('/').map(encodeURIComponent).join('/');
  const branch = env.GITHUB_BRANCH || 'main';
  return { url: `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/${path}`, branch };
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64ToText(value) {
  const binary = atob(value.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

async function readState(env) {
  const { url, branch } = repositoryConfig(env);
  const result = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers: githubHeaders(env) });
  if (result.status === 404) return { status: 404 };
  if (!result.ok) return { status: 502, error: `GitHub read failed (${result.status}).` };
  const file = await result.json();
  return { status: 200, sha: file.sha, text: base64ToText(file.content) };
}

async function writeState(env, text) {
  const { url, branch } = repositoryConfig(env);
  const content = `${text}\n`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = await readState(env);
    if (current.status !== 200 && current.status !== 404) return current;
    if (current.text === content) return { status: 200 };
    const body = {
      message: 'Update shared family event state',
      content: bytesToBase64(new TextEncoder().encode(content)),
      branch
    };
    if (current.sha) body.sha = current.sha;
    const result = await fetch(url, {
      method: 'PUT',
      headers: { ...githubHeaders(env), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (result.ok) return { status: 200 };
    if (result.status !== 409) return { status: 502, error: `GitHub write failed (${result.status}).` };
  }
  return { status: 409, error: 'The state changed at the same time. Please try again.' };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return response(request, env, null, 204);
    const origin = request.headers.get('Origin');
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) {
      return response(request, env, 'Origin not allowed.', 403);
    }
    try {
      if (request.method === 'GET') {
        const result = await readState(env);
        if (result.status === 404) return response(request, env, null, 404);
        if (result.status !== 200) return response(request, env, result.error, result.status);
        return response(request, env, result.text, 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      }
      if (request.method === 'PUT') {
        if (Number(request.headers.get('Content-Length') || 0) > 1_000_000) return response(request, env, 'State is too large.', 413);
        const state = await request.json();
        if (!state || typeof state !== 'object' || !state.events || !Array.isArray(state.accounts)) {
          return response(request, env, 'Invalid application state.', 400);
        }
        const text = JSON.stringify(state, null, 2);
        if (text.length > 1_000_000) return response(request, env, 'State is too large.', 413);
        const result = await writeState(env, text);
        return response(request, env, result.error || null, result.status);
      }
      return response(request, env, 'Method not allowed.', 405, { 'Allow': 'GET, PUT, OPTIONS' });
    } catch (error) {
      console.error(error);
      return response(request, env, 'Unable to access shared state.', 500);
    }
  }
};
