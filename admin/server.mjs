import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join } from 'node:path';

const require = createRequire(import.meta.url);
const sdk = require.resolve.paths('@supabase/supabase-js')
  .map(root => join(root, '@supabase/supabase-js/dist/umd/supabase.js'))
  .find(existsSync);
if (!sdk) throw new Error('Install the project dependencies with npm ci before starting the CMS.');
const paths = new Map([
  ['/', ['index.html', 'text/html']],
  ['/cms.mjs', ['cms.mjs', 'text/javascript']],
  ['/fields.mjs', ['fields.mjs', 'text/javascript']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/supabase.js', [sdk, 'text/javascript']],
]);
const url = process.env.CAMPUS_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = process.env.CAMPUS_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
if (key && !/^sb_publishable_[\w-]+$/.test(key)) {
  throw new Error('Use a Supabase publishable key starting with sb_publishable_.');
}
const connectOrigin = url ? new URL(url).origin : '';
if (url && !connectOrigin.startsWith('https://') && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(connectOrigin)) {
  throw new Error('Use HTTPS for the Supabase project URL.');
}

createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self' " + connectOrigin + "; form-action 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (req.method !== 'GET') {
    res.writeHead(405).end();
    return;
  }
  if (path === '/config.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ url, key }));
    return;
  }
  const asset = paths.get(path);
  if (!asset) {
    res.writeHead(404).end();
    return;
  }
  try {
    const [file, type] = asset;
    const data = await readFile(isAbsolute(file) ? file : new URL(file, import.meta.url));
    res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' }).end(data);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Could not load this asset.');
  }
}).listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => {
  console.log('Campus Guide CMS listening on port ' + (process.env.PORT || 4173));
});
