// Servidor local sem dependências externas.
const http = require('http');
const fs = require('fs');
const path = require('path');
const {URL} = require('url');
const root = __dirname;
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};

function reply(res, status, body, headers={}) {
  res.writeHead(status, headers); res.end(body);
}

async function preview(res, targetUrl) {
  try {
    const target = new URL(targetUrl);
    if (!/^https?:$/.test(target.protocol)) throw new Error();
    const upstream = await fetch(target, {headers:{'user-agent':'Mozilla/5.0 CPG Creative Generator'}});
    if (!upstream.ok) throw new Error();
    const html = await upstream.text();
    const meta = key => { const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'); const m=html.match(re); return m && (m[1]||m[2]); };
    const sourceImage = meta('og:image') ? new URL(meta('og:image'), target).href : '';
    reply(res, 200, JSON.stringify({title:meta('og:title') || meta('twitter:title') || '', image:sourceImage ? `/api/image?url=${encodeURIComponent(sourceImage)}` : ''}), {'Content-Type':'application/json','Cache-Control':'no-store'});
  } catch { reply(res, 422, JSON.stringify({error:'Não foi possível extrair os dados da matéria'}), {'Content-Type':'application/json'}); }
}

async function image(res, targetUrl) {
  try {
    const target = new URL(targetUrl);
    if (!/^https?:$/.test(target.protocol)) throw new Error();
    const upstream = await fetch(target, {headers:{'user-agent':'Mozilla/5.0 CPG Creative Generator'}});
    const type = upstream.headers.get('content-type') || '';
    if (!upstream.ok || !type.startsWith('image/')) throw new Error();
    reply(res, 200, Buffer.from(await upstream.arrayBuffer()), {'Content-Type':type,'Access-Control-Allow-Origin':'*'});
  } catch { reply(res, 422, JSON.stringify({error:'Não foi possível carregar a imagem'}), {'Content-Type':'application/json'}); }
}

http.createServer((req, res) => {
  const requestUrl = new URL(req.url, 'http://localhost');
  if (requestUrl.pathname === '/api/preview') return preview(res, requestUrl.searchParams.get('url'));
  if (requestUrl.pathname === '/api/image') return image(res, requestUrl.searchParams.get('url'));
  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const file = path.normalize(path.join(root, pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return reply(res, 404, 'Não encontrado');
  reply(res, 200, fs.readFileSync(file), {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
}).listen(3000, () => console.log('Gerador disponível em http://localhost:3000'));
