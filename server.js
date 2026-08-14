// Entrada de produção para a Vercel. As funções em api/ continuam responsáveis
// pela leitura de matérias; esta função entrega a interface e os assets.
const fs = require('fs');
const path = require('path');
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const preview = require('./api/preview');
const image = require('./api/image');

function withResponseHelpers(res) {
  if (!res.status) res.status = code => { res.statusCode = code; return res; };
  if (!res.json) res.json = body => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); };
  if (!res.send) res.send = body => res.end(body);
  return res;
}

module.exports = (req, res) => {
  const requestPath = new URL(req.url || '/', 'http://localhost').pathname;
  const query = new URL(req.url || '/', 'http://localhost').searchParams;
  if (requestPath === '/api/preview') {
    req.query = {url: query.get('url')};
    return preview(req, withResponseHelpers(res));
  }
  if (requestPath === '/api/image') {
    req.query = {url: query.get('url')};
    return image(req, withResponseHelpers(res));
  }
  // A Vercel pode encaminhar o root a esta função com um prefixo interno.
  // A interface é uma SPA estática: todo caminho não relacionado a assets
  // deve receber o index.html.
  const relative = requestPath.startsWith('/assets/')
    ? requestPath.replace(/^\/+/, '')
    : 'index.html';
  const file = path.join(__dirname, relative);
  try {
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.statusCode = 200;
    res.end(fs.readFileSync(file));
  } catch {
    res.statusCode = 404;
    res.end('Não encontrado');
  }
};
