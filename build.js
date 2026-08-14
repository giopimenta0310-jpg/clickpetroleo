// Gera os arquivos estáticos que a Vercel deve servir em produção.
const fs = require('fs');
const path = require('path');
const root = __dirname;
const output = path.join(root, 'public');
fs.rmSync(output, {recursive:true, force:true});
fs.mkdirSync(output, {recursive:true});
fs.copyFileSync(path.join(root, 'index.html'), path.join(output, 'index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {recursive:true});
console.log('Arquivos estáticos gerados em public/.');
