import { Router } from 'express';
import { readData, writeData, nextId } from '../db/store.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, (req, res) => {
  const { search } = req.query;
  const data = readData();
  let rows = data.products;
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(s) ||
        (p.brand || '').toLowerCase().includes(s) ||
        (p.car_models || '').toLowerCase().includes(s)
    );
  }
  res.json([...rows].sort((a, b) => a.name.localeCompare(b.name)));
});

router.get('/low-stock', authRequired, (req, res) => {
  const data = readData();
  const rows = data.products.filter((p) => p.quantity <= p.min_quantity).sort((a, b) => a.quantity - b.quantity);
  res.json(rows);
});

router.get('/:id', authRequired, (req, res) => {
  const data = readData();
  const row = data.products.find((p) => p.id == req.params.id);
  if (!row) return res.status(404).json({ error: 'Topilmadi' });
  res.json(row);
});

router.post('/', authRequired, roleRequired('admin', 'omborchi'), (req, res) => {
  const { name, brand, category, part_type, purchase_price, sale_price, quantity, min_quantity, car_models } = req.body;
  if (!name || !part_type) return res.status(400).json({ error: 'Nomi va turi majburiy' });
  const data = readData();
  const id = nextId(data, 'products');
  const now = new Date().toISOString();
  data.products.push({
    id,
    name,
    brand: brand || '',
    category: category || '',
    part_type,
    purchase_price: purchase_price || 0,
    sale_price: sale_price || 0,
    quantity: quantity || 0,
    min_quantity: min_quantity ?? 2,
    car_models: car_models || '',
    created_at: now,
    updated_at: now,
  });
  writeData(data);
  res.json({ id });
});

router.put('/:id', authRequired, roleRequired('admin', 'omborchi'), (req, res) => {
  const data = readData();
  const idx = data.products.findIndex((p) => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });
  const { name, brand, category, part_type, purchase_price, sale_price, quantity, min_quantity, car_models } = req.body;
  data.products[idx] = {
    ...data.products[idx],
    name,
    brand,
    category,
    part_type,
    purchase_price,
    sale_price,
    quantity,
    min_quantity,
    car_models,
    updated_at: new Date().toISOString(),
  };
  writeData(data);
  res.json({ success: true });
});

router.delete('/:id', authRequired, roleRequired('admin'), (req, res) => {
  const data = readData();
  data.products = data.products.filter((p) => p.id != req.params.id);
  writeData(data);
  res.json({ success: true });
});

export default router;
