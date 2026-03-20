export interface ScanResultItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ScanResult {
  items: ScanResultItem[];
  storeName: string | null;
  date: string | null;
}

const AI_PROMPT = `Проанализируй фото чека и извлеки все купленные товары.

Верни JSON в точном формате:
{
  "items": [{ "name": "название товара", "price": 0.00, "quantity": 1, "total": 0.00 }],
  "storeName": "название магазина или null",
  "date": "YYYY-MM-DD или null"
}

Правила:
- "name" — читаемое название товара на русском (расшифруй сокращения)
- "price" — цена за единицу (число)
- "quantity" — количество (по умолчанию 1)
- "total" — итоговая стоимость позиции (price * quantity)
- Если есть скидка на позицию, учти её в price
- Не включай итоговые суммы чека, только отдельные товары
- Верни ТОЛЬКО JSON без markdown`;

const DAILY_LIMIT = 200;
const STORAGE_KEY = 'ai_daily_usage';

function getDailyUsage(): { date: string; count: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { date: '', count: 0 };
}

function incrementUsage(): void {
  const today = new Date().toISOString().split('T')[0];
  const usage = getDailyUsage();
  const count = usage.date === today ? usage.count + 1 : 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
}

export function getRemainingScans(): number {
  const today = new Date().toISOString().split('T')[0];
  const usage = getDailyUsage();
  const used = usage.date === today ? usage.count : 0;
  return Math.max(0, DAILY_LIMIT - used);
}

/**
 * Send compressed image to OpenRouter vision model
 */
async function parseReceiptWithVision(
  base64: string,
  mimeType: string,
  onProgress?: (step: string) => void
): Promise<ScanResult> {
  const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // Vision models sorted by reliability for free tier
  const models = [
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'google/gemma-3-12b-it:free',
    'google/gemma-3-4b-it:free',
  ];

  for (const model of models) {
    const shortName = model.split('/')[1].split(':')[0];
    onProgress?.(`Анализ чека (${shortName})...`);

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: AI_PROMPT },
                  {
                    type: 'image_url',
                    image_url: { url: `data:${mimeType};base64,${base64}` },
                  },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 4096,
          }),
        });

        if (response.status === 429 && attempt === 0) {
          for (let s = 30; s > 0; s--) {
            onProgress?.(`${shortName} занят, повтор через ${s} сек...`);
            await new Promise(r => setTimeout(r, 1000));
          }
          continue;
        }

        if (!response.ok) {
          console.log(`${model}: HTTP ${response.status}`);
          break; // try next model
        }

        const result = await response.json();
        const textContent = result?.choices?.[0]?.message?.content;
        if (!textContent) break;

        const parsed = parseJsonResponse(textContent);
        if (parsed && parsed.items.length > 0) {
          incrementUsage();
          return parsed;
        }
        console.log(`${model}: parsed but empty items`);
        break; // try next model
      } catch (err) {
        console.log(`${model}: network error`, err);
        break; // try next model
      }
    }
  }

  throw new Error('Не удалось распознать товары. Попробуйте сделать более чёткое фото чека.');
}

function parseJsonResponse(textContent: string): ScanResult | null {
  // Extract JSON from markdown code blocks or raw text
  const codeBlockMatch = textContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : textContent.trim();

  // Find the outermost JSON object
  const startIdx = jsonStr.indexOf('{');
  const lastIdx = jsonStr.lastIndexOf('}');
  if (startIdx === -1 || lastIdx === -1) return null;
  const cleanJson = jsonStr.substring(startIdx, lastIdx + 1);

  try {
    const parsed = JSON.parse(cleanJson);
    if (!Array.isArray(parsed.items)) return null;

    return {
      items: parsed.items
        .map((item: any) => ({
          name: String(item.name || ''),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          total: Number(item.total) || 0,
        }))
        .filter((item: ScanResultItem) => item.price > 0 && item.name.length > 1),
      storeName: parsed.storeName || null,
      date: parsed.date || null,
    };
  } catch {
    console.error('Failed to parse AI response:', textContent);
    return null;
  }
}

/**
 * Main function
 */
export const scanReceiptFromImage = async (
  base64: string,
  mimeType: string,
  onProgress?: (step: string) => void
): Promise<ScanResult> => {
  if (getRemainingScans() <= 0) {
    throw new Error(`Дневной лимит исчерпан (${DAILY_LIMIT}/день). Попробуйте завтра.`);
  }

  return parseReceiptWithVision(base64, mimeType, onProgress);
};
