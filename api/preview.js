// Vercel Serverless Function: extrai metadados Open Graph de uma matéria.
module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({error: 'url obrigatória'});
  try {
    const target = new URL(url);
    if (!/^https?:$/.test(target.protocol)) throw new Error('protocolo inválido');
    const response = await fetch(target, {headers: {'user-agent': 'Mozilla/5.0 CPG Creative Generator'}});
    if (!response.ok) throw new Error('fonte indisponível');
    const html = await response.text();
    const meta = key => { const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'); const m=html.match(re); return m && (m[1]||m[2]); };
    const image = meta('og:image');
    res.setHeader('Cache-Control', 's-maxage=3600');
    const sourceImage = image ? new URL(image, target).href : '';
    res.status(200).json({
      title: meta('og:title') || meta('twitter:title') || '',
      // A imagem passa pelo proxy para preservar CORS e permitir exportar o canvas.
      image: sourceImage ? `/api/image?url=${encodeURIComponent(sourceImage)}` : ''
    });
  } catch (error) { res.status(422).json({error: 'Não foi possível extrair os dados da matéria'}); }
};
