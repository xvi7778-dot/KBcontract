import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const newRecord = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      customerName: data.customerName || '',
      phone: data.phone || '',
      email: data.email || '',
      typedSign: data.typedSign || '',
      handSignImage: data.handSignImage || '',
      pdfName: data.pdfName || ''
    };

    const existing = await kv.lrange('submissions', 0, -1);
    await kv.lpush('submissions', JSON.stringify(newRecord));

    return res.status(200).json({ success: true, message: '✅ 提交成功！数据已永久保存', recordId: newRecord.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
