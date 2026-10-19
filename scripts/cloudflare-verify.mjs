import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';

const originIndex = process.argv.indexOf('--origin');
const remote = originIndex < 0 ? null : process.argv[originIndex + 1];
if (originIndex >= 0 && !remote) throw new Error('--origin requires an HTTPS URL');
if (remote && new URL(remote).protocol !== 'https:') throw new Error('Remote verification requires HTTPS');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function smoke(origin, { localAssets = false } = {}) {
  const request = async (path, status = 200, options = {}) => {
    const response = await fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(20000), ...options });
    assert.equal(response.status, status, `${path}: expected ${status}, received ${response.status}`);
    return response;
  };
  const locales = ['ko', 'en', 'ja', 'zh'];
  for (const locale of locales) {
    const redirect = await request('/', 307, { headers: { 'Accept-Language': locale } });
    assert.equal(new URL(redirect.headers.get('location'), origin).pathname, `/${locale}`);
    const html = await (await request(`/${locale}`)).text();
    assert.ok(html.includes(`<html lang="${locale}"`), `${locale}: language`);
    assert.match(html, /<h1[ >]/, `${locale}: SSR heading`);
    assert.ok(html.includes(`https://tailbound.xyz/${locale}`), `${locale}: canonical`);
    assert.ok(html.includes('application/ld+json'), `${locale}: structured data`);
    assert.ok(html.includes('apps.apple.com/'), `${locale}: App Store link`);
    assert.ok(html.includes('play.google.com/'), `${locale}: Google Play link`);
    assert.ok(html.includes('googletagmanager.com/gtag/js'), `${locale}: analytics`);
    assert.ok(html.includes('data-analytics-event="store_redirect"'), `${locale}: conversion tracking`);
    const script = html.match(/src="([^" ]*\/_next\/static\/[^" ]+\.js)"/);
    assert.ok(script, `${locale}: browser bundle`);
    const bundle = await request(script[1]);
    assert.match(bundle.headers.get('content-type') ?? '', /javascript/);
  }
  const cookieRedirect = await request('/', 307, { headers: { 'Accept-Language': 'en', cookie: 'NEXT_LOCALE=ja' } });
  assert.equal(new URL(cookieRedirect.headers.get('location'), origin).pathname, '/ja');
  for (const path of ['/ads.txt', '/app-ads.txt']) {
    const response = await request(path);
    assert.match(response.headers.get('content-type') ?? '', /text\/plain/);
    assert.equal((await response.text()).trim(), 'google.com, pub-2202284171552842, DIRECT, f08c47fec0942fa0');
  }
  const sitemap = await (await request('/sitemap.xml')).text();
  for (const locale of locales) assert.ok(sitemap.includes(`https://tailbound.xyz/${locale}`));
  assert.ok((await (await request('/robots.txt')).text()).includes('https://tailbound.xyz/sitemap.xml'));
  for (const path of ['/og.png', '/poster.webp', '/title.png', '/icon.png']) await request(path);
  // Miniflare's asset worker returns the whole blob: it does not implement the
  // production CDN's range handling. Keep the public HTTPS check strict.
  const video = await request('/preview.mp4', localAssets ? 200 : 206, { headers: { Range: 'bytes=0-1023' } });
  assert.match(video.headers.get('content-type') ?? '', /video\/mp4/);
  const bytes = Buffer.from(await video.arrayBuffer());
  if (localAssets) assert.deepEqual(bytes, await readFile('public/preview.mp4'));
  else {
    assert.equal(bytes.byteLength, 1024);
    assert.match(video.headers.get('content-range') ?? '', /^bytes 0-1023\/\d+$/);
  }
  for (const path of ['/ko/__missing__', '/.env', '/package.json', '/src/lib/analytics.ts']) await request(path, 404);
  console.log(`CF-SMOKE-OK ${origin}: four locales, cookie routing, store tracking, ads, metadata, assets and ${localAssets ? 'video bytes (CDN ranges require public verification)' : 'CDN video ranges'}.`);
}

async function main() {
  if (remote) return smoke(remote);
  const socket = createServer();
  await new Promise((resolve, reject) => { socket.once('error', reject); socket.listen(0, '127.0.0.1', resolve); });
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn('pnpm', ['exec', 'wrangler', 'dev', '--config', 'wrangler.jsonc', '--ip', '127.0.0.1', '--port', String(port), '--show-interactive-dev-session=false'], {
    stdio: 'inherit', detached: process.platform !== 'win32',
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false', NEXT_TELEMETRY_DISABLED: '1' },
  });
  let startupError;
  child.once('error', error => { startupError = error; });
  try {
    const until = Date.now() + 60000;
    for (;;) {
      if (startupError) throw startupError;
      if (child.exitCode !== null) throw new Error(`workerd exited before verification (${child.exitCode})`);
      try {
        if ((await fetch(`${origin}/ko`, { signal: AbortSignal.timeout(3000) })).ok) break;
      } catch { /* Wait for the local runtime, never ignore a smoke failure. */ }
      if (Date.now() >= until) throw new Error('Local Cloudflare runtime did not become ready');
      await sleep(300);
    }
    await smoke(origin, { localAssets: true });
  } finally {
    if (child.pid) {
      try { process.platform === 'win32' ? child.kill('SIGTERM') : process.kill(-child.pid, 'SIGTERM'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  }
}

await main();
