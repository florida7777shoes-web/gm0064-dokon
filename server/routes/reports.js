import { Router } from 'express';
import { readData } from '../db/store.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authRequired, (req, res) => {
  const data = readData();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';

  const todaySalesArr = data.sales.filter((s) => s.created_at.slice(0, 10) === today);
  const monthSalesArr = data.sales.filter((s) => s.created_at.slice(0, 10) >= monthStart);

  const totalDebtRaw = data.sales.reduce((sum, s) => sum + s.debt_amount, 0);
  const totalPaidDebt = data.debt_payments.reduce((sum, p) => sum + p.amount, 0);

  const lowStockCount = data.products.filter((p) => p.quantity <= p.min_quantity).length;

  const productAgg = {};
  for (const it of data.sale_items) {
    if (!productAgg[it.product_id]) productAgg[it.product_id] = { product_name: it.product_name, total_qty: 0, total_sum: 0 };
    productAgg[it.product_id].total_qty += it.quantity;
    productAgg[it.product_id].total_sum += it.total_price;
  }
  const topProducts = Object.values(productAgg)
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5);

  res.json({
    todaySales: { total: todaySalesArr.reduce((s, x) => s + x.total_amount, 0), count: todaySalesArr.length },
    monthSales: { total: monthSalesArr.reduce((s, x) => s + x.total_amount, 0), count: monthSalesArr.length },
    totalDebt: totalDebtRaw - totalPaidDebt,
    lowStockCount,
    productCount: data.products.length,
    topProducts,
  });
});

router.get('/daily', authRequired, (req, res) => {
  const data = readData();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const recent = data.sales.filter((s) => new Date(s.created_at) >= cutoff);
  const byDay = {};
  for (const s of recent) {
    const day = s.created_at.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + s.total_amount;
  }
  const rows = Object.entries(byDay)
    .map(([day, total]) => ({ day, total }))
    .sort((a, b) => a.day.localeCompare(b.day));
  res.json(rows);
});

export default router;
