# CPG — Gerador de Criativos

Gerador de Feed (1080×1350) e Stories (1080×1920) para Click Petróleo e Gás.

## Uso local

```bash
node local-server.js
```

Abra `http://localhost:3000` e mantenha o terminal aberto durante o uso.

## Publicação na Vercel

Importe este repositório na Vercel e faça o deploy sem comandos de build. A Vercel serve o `index.html` diretamente e publica as funções em `api/`, que extraem título e imagem Open Graph das matérias. O arquivo `local-server.js` é usado somente no computador local e não é uma rota de produção.
