import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface ReceiptResult {
  items: ReceiptItem[];
  storeName: string | null;
  date: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS
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
      return res.status(502).json({ error: `proverkacheka вернул ошибку: ${postResponse.status}` });
    }

    const html = await postResponse.text();

    // Step 2: Find the first check URL from response
    const checkUrlMatch = html.match(/check\/[\w-]+/);
    if (!checkUrlMatch) {
      return res.status(404).json({ error: 'Чек не найден. Возможно QR код не зарегистрирован в системе.' });
    }

    const checkUrl = `https://proverkacheka.com/${checkUrlMatch[0]}`;

    // Step 3: GET the check page
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!checkResponse.ok) {
      return res.status(502).json({ error: `Не удалось загрузить страницу чека: ${checkResponse.status}` });
    }

    const checkHtml = await checkResponse.text();

    // Step 4: Parse receipt items from HTML
    const result = parseReceiptHtml(checkHtml, qrraw);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('check-receipt error:', error?.message || error);
    return res.status(500).json({ error: `Ошибка сервера: ${error?.message || 'unknown'}` });
  }
}

function parseReceiptHtml(html: string, qrraw: string): ReceiptResult {
  const items: ReceiptItem[] = [];

  // Match items: look for rows with b-check_item class that have 5 td cells
  const rowRegex = /<tr[^>]*b-check_item[^>]*>([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];

    // Extract td contents
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const cells: string[] = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(row)) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());
    }

    // Valid item row: number, name, price, quantity, total (5 cells)
    if (cells.length >= 5) {
      const name = cells[1];
      const price = parseFloat(cells[2]) || 0;
      const quantity = parseFloat(cells[3]) || 1;
      const total = parseFloat(cells[4]) || 0;

      // Skip НДС lines and empty names
      if (name && price > 0 && !name.includes('НДС')) {
        items.push({ name, price, quantity, total });
      }
    }
  }

  // Parse store name (first center row usually)
  const storeMatch = html.match(/b-check_vblock-middle\s+b-check_center"><td\s+colspan="5">(.*?)<\/td>/);
  const storeName = storeMatch
    ? storeMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
    : null;

  // Parse date from QR raw or HTML
  let date: string | null = null;
  const dateFromQr = qrraw.match(/t=(\d{4})(\d{2})(\d{2})/);
  if (dateFromQr) {
    date = `${dateFromQr[1]}-${dateFromQr[2]}-${dateFromQr[3]}`;
  } else {
    const dateFromHtml = html.match(/(\d{2})\.(\d{2})\.(\d{4})\s+\d{2}:\d{2}/);
    if (dateFromHtml) {
      date = `${dateFromHtml[3]}-${dateFromHtml[2]}-${dateFromHtml[1]}`;
    }
  }

  return { items, storeName, date };
}
