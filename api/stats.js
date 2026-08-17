import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const list = await kv.lrange('submissions', 0, -1);
  const data = list.map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  res.status(200).json({
    total: data.length,
    today: data.filter(d => d.createdAt?.slice(0, 10) === today).length,
    thisMonth: data.filter(d => d.createdAt?.slice(0, 7) === thisMonth).length
  });
}
