// Initial single-release offline bundle. Multi-release installed-iOS update verification is still required.
import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
const root='dist', base=process.env.TINY_BASE||'/tiny-town-adventures/';
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const full=join(dir,entry.name);if(entry.isDirectory())await walk(full);else if(!['sw.js','release.json'].includes(entry.name))files.push(base+relative(root,full).replaceAll('\\','/'));}}
await walk(root);
const version=process.env.GITHUB_SHA||process.env.TINY_BUILD_ID||'local-development';
await writeFile(join(root,'release.json'),JSON.stringify({version},null,2));
files.push(base+'release.json');
const sw=`const CACHE=${JSON.stringify('tiny-town-'+version)};const FILES=${JSON.stringify(files)};self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;if(url.pathname.endsWith('/release.json')){event.respondWith(fetch(event.request));return;}event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(result=>result|| (event.request.mode==='navigate'?caches.match(${JSON.stringify(base+'index.html')}):Response.error()))));});`;
await writeFile(join(root,'sw.js'),sw);
console.log('Prepared offline files:',files.length,'version:',version);