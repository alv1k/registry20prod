module.exports = async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const qrraw = req.body?.qrraw;

    if (!qrraw || typeof qrraw !== 'string') {
      return res.status(400).json({ error: 'qrraw parameter is required' });
    }

    // Step 1: POST QR data to proverkacheka.com
    const postResponse = await fetch('https://proverkacheka.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://proverkacheka.com/',
      },
      body: `qrraw=${encodeURIComponent(qrraw)}`,
    });

    if (!postResponse.ok) {
      return res.status(502).json({ error: `proverkacheka error: ${postResponse.status}` });
    }

    const html = await postResponse.text();

    // Step 2: Find check URL
    const checkUrlMatch = html.match(/check\/[\w-]+/);
    if (!checkUrlMatch) {
      return res.status(404).json({ error: 'Чек не найден в системе.' });
    }

    const checkUrl = `https://proverkacheka.com/${checkUrlMatch[0]}`;

    // Step 3: GET check page
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!checkResponse.ok) {
      return res.status(502).json({ error: `Check page error: ${checkResponse.status}` });
    }

    const checkHtml = await checkResponse.text();

    // Step 4: Parse items
    const items = [];
    const rowRegex = /<tr[^>]*b-check_item[^>]*>([\s\S]*?)<\/tr>/g;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(checkHtml)) !== null) {
      const row = rowMatch[1];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      const cells = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(row)) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());
      }

      if (cells.length >= 5) {
        const name = cells[1];
        const price = parseFloat(cells[2]) || 0;
        const quantity = parseFloat(cells[3]) || 1;
        const total = parseFloat(cells[4]) || 0;

        if (name && price > 0 && !name.includes('НДС')) {
          items.push({ name, price, quantity, total });
        }
      }
    }

    // Parse store name
    const storeMatch = checkHtml.match(/b-check_vblock-middle\s+b-check_center"><td\s+colspan="5">(.*?)<\/td>/);
    const storeName = storeMatch
      ? storeMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
      : null;

    // Parse date
    let date = null;
    const dateFromQr = qrraw.match(/t=(\d{4})(\d{2})(\d{2})/);
    if (dateFromQr) {
      date = `${dateFromQr[1]}-${dateFromQr[2]}-${dateFromQr[3]}`;
    }

    return res.status(200).json({ items, storeName, date });
  } catch (error) {
    console.error('check-receipt error:', error);
    return res.status(500).json({ error: `Server error: ${error?.message || 'unknown'}` });
  }
};
