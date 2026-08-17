import { kv } from '@vercel/kv';
import XLSX from 'xlsx';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const list = await kv.lrange('submissions', 0, -1);
  const data = list.map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

  const exportData = data.map(d => ({
    '提交时间': d.createdAt ? new Date(d.createdAt).toLocaleString('zh-CN') : '-',
    '客户姓名': d.customerName || '-',
    '联系电话': d.phone || '-',
    '邮箱': d.email || '-',
    '签名状态': d.typedSign || d.handSignImage ? '✅ 已签名' : '❌ 未签名',
    'PDF文件名': d.pdfName || '-'
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), '提交数据');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const base64 = buf.toString('base64');

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=签约数据_${new Date().toISOString().slice(0,10)}.xlsx`);
  res.status(200).send(Buffer.from(base64, 'base64'));
}
