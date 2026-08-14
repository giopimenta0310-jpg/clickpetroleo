// Entrada de produção para a Vercel. As funções em api/ continuam responsáveis
// pela leitura de matérias; esta função entrega a interface e os assets.
const fs = require('fs');
const path = require('path');
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};

module.exports = (req, res) => {
  const requestPath = new URL(req.url, 'http://localhost').pathname;
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  if (!(/^(index\.html|assets\/[a-zA-Z0-9._-]+)$/).test(relative)) {
    res.statusCode = 404;
    return res.end('Não encontrado');
  }
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
