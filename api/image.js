// Proxy de imagem para o canvas: necessário porque muitas fontes não liberam CORS.
module.exports = async (req, res) => {
  try {
    const target = new URL(req.query.url);
    if (!/^https?:$/.test(target.protocol)) throw new Error('protocolo inválido');
    const upstream = await fetch(target, {headers: {'user-agent': 'Mozilla/5.0 CPG Creative Generator'}});
    const type = upstream.headers.get('content-type') || '';
    if (!upstream.ok || !type.startsWith('image/')) throw new Error('imagem indisponível');
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) { res.status(422).json({error: 'Não foi possível carregar a imagem'}); }
};
