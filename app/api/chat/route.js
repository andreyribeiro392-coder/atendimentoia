import crypto from 'crypto';
import { NextResponse } from 'next/server';

const day = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

async function fetchWithTimeout(url, options, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' }); }
  finally { clearTimeout(timer); }
}

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('UPSTASH_NOT_CONFIGURED');
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  }, 7000);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(`UPSTASH_${data.error || response.status}`);
  return data.result;
}

export async function POST(request) {
  let usageKey = '';
  let reserved = false;
  try {
    const { message = '' } = await request.json();
    const text = String(message).trim();
    if (text.length < 2 || text.length > 5000) return NextResponse.json({ error: 'Escreva uma mensagem com pelo menos 2 caracteres.' }, { status: 400 });
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_NOT_CONFIGURED');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const fingerprint = `${ip}:${request.headers.get('user-agent') || ''}:${process.env.AUTH_SECRET || 'free-usage'}`;
    const id = crypto.createHash('sha256').update(fingerprint).digest('hex').slice(0, 24);
    usageKey = `ontop:free:${id}:${day()}`;
    const used = Number(await redis(['INCR', usageKey]));
    reserved = true;
    if (used === 1) await redis(['EXPIRE', usageKey, 172800]);
    if (used > 5) {
      await redis(['DECR', usageKey]); reserved = false;
      return NextResponse.json({ error: 'Você utilizou as 5 respostas gratuitas de hoje.', remaining: 0 }, { status: 429 });
    }
    const groq = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', temperature: 0.65, max_tokens: 450, messages: [
        { role: 'system', content: 'Você é a assistente OnTop para profissionais de beleza que atendem pelo WhatsApp. Escreva uma resposta curta, natural, profissional e pronta para copiar, em português brasileiro, focada em conseguir o agendamento sem pressionar e sem prometer resultados.' },
        { role: 'user', content: text }
      ] })
    });
    const data = await groq.json();
    if (!groq.ok || !data.choices?.[0]?.message?.content) throw new Error(`GROQ_${groq.status}`);
    await redis(['HINCRBY', 'ontop:metrics', 'free_ai_answers', 1]).catch(() => {});
    return NextResponse.json({ answer: data.choices[0].message.content, remaining: 5 - used });
  } catch (error) {
    if (reserved && usageKey) await redis(['DECR', usageKey]).catch(() => {});
    console.error('[free/chat] failed', { message: error?.message, name: error?.name });
    const timeout = error?.name === 'AbortError';
    return NextResponse.json({ error: timeout ? 'A resposta demorou além do esperado. Tente novamente.' : 'A assistente está temporariamente indisponível. Tente novamente em instantes.' }, { status: timeout ? 504 : 503 });
  }
}
