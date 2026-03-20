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

  const { qrraw } = req.body;

  if (!qrraw || typeof qrraw !== 'string') {
    return res.status(400).json({ error: 'qrraw parameter is required' });
  }

  try {
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

    const html = await postResponse.text();

    // Step 2: Find the check URL from response
    const checkUrlMatch = html.match(/check\/[\w-]+/);
    if (!checkUrlMatch) {
      return res.status(404).json({ error: 'Чек не найден. Возможно, QR код некорректный.' });
    }

    const checkUrl = `https://proverkacheka.com/${checkUrlMatch[0]}`;

    // Step 3: GET the check page
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const checkHtml = await checkResponse.text();

    // Step 4: Parse receipt items from HTML
    const result = parseReceiptHtml(checkHtml, qrraw);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('check-receipt error:', error);
    return res.status(500).json({ error: 'Ошибка при проверке чека' });
  }
}

function parseReceiptHtml(html: string, qrraw: string): ReceiptResult {
  const items: ReceiptItem[] = [];

  // Parse items from b-check_item rows
  // Format: <tr class="b-check_item"><td>1</td><td>Name</td><td>Price</td><td>Qty</td><td>Total</td></tr>
  const itemRegex = /b-check_vblock-first\s+b-check_item"><td>\d*<\/td><td>(.*?)<\/td><td>([\d.]+)<\/td><td>([\d.]+)<\/td><td>([\d.]+)<\/td>/g;
  let match;

  while ((match = itemRegex.exec(html)) !== null) {
    const name = match[1].replace(/<[^>]*>/g, '').trim();
    const price = parseFloat(match[2]) || 0;
    const quantity = parseFloat(match[3]) || 1;
    const total = parseFloat(match[4]) || 0;

    if (name && price > 0) {
      items.push({ name, price, quantity, total });
    }
  }

  // If first regex didn't match, try simpler pattern
  if (items.length === 0) {
    const simpleRegex = /b-check_item"><td>\d*<\/td><td>([^<]+)<\/td><td>([\d.]+)<\/td><td>([\d.]+)<\/td><td>([\d.]+)<\/td>/g;
    while ((match = simpleRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const price = parseFloat(match[2]) || 0;
      const quantity = parseFloat(match[3]) || 1;
      const total = parseFloat(match[4]) || 0;

      // Skip НДС lines
      if (name && price > 0 && !name.includes('НДС')) {
        items.push({ name, price, quantity, total });
      }
    }
  }

  // Parse store name
  const storeMatch = html.match(/b-check_vblock-middle\s+b-check_center"><td\s+colspan="5">(.*?)<\/td>/);
  const storeName = storeMatch ? storeMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim() : null;

  // Parse date from QR raw data or from HTML
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
