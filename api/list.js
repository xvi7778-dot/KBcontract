import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { search = '', page = 1, pageSize = 20 } = req.query;

  let list = await kv.lrange('submissions', 0, -1);
  let data = list.map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

  if (search) {
    const kw = search.toLowerCase();
    data = data.filter(d =>
      (d.customerName || '').toLowerCase().includes(kw) ||
      (d.phone || '').includes(kw) ||
      (d.email || '').toLowerCase().includes(kw)
    );
  }

  const total = data.length;
  const result = data.slice((Number(page) - 1) * Number(pageSize), Number(page) * Number(pageSize));

  res.status(200).json({ total, page: Number(page), pageSize: Number(pageSize), list: result });
}
