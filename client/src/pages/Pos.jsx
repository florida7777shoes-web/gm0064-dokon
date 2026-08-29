import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

function money(n) {
  return Number(n || 0).toLocaleString('uz-UZ') + " so'm";
}

export default function Pos() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.listProducts().then(setProducts);
    api.listCustomers().then(setCustomers);
  }, []);

  function search_(s) {
    setSearch(s);
    api.listProducts(s).then(setProducts);
  }

  function addToCart(p) {
    setCart((prev) => {
      const found = prev.find((it) => it.product_id === p.id);
      if (found) {
        return prev.map((it) => (it.product_id === p.id ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [...prev, { product_id: p.id, product_name: p.name, unit_price: p.sale_price, quantity: 1, max: p.quantity }];
    });
  }

  function updateQty(id, qty) {
    setCart((prev) => prev.map((it) => (it.product_id === id ? { ...it, quantity: Math.max(1, qty) } : it)));
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((it) => it.product_id !== id));
  }

  const total = cart.reduce((s, it) => s + it.quantity * it.unit_price, 0);

  async function handleCheckout(payment_type) {
    setMessage('');
    if (cart.length === 0) return;
    try {
      const paid = payment_type === 'qarz' ? (paidAmount === '' ? 0 : +paidAmount) : total;
      await api.createSale({
        customer_id: customerId || null,
        items: cart.map(({ product_id, product_name, quantity, unit_price }) => ({ product_id, product_name, quantity, unit_price })),
        paid_amount: paid,
        payment_type,
      });
      setMessage('✅ Sotuv muvaffaqiyatli amalga oshirildi!');
      setCart([]);
      setCustomerId('');
      setPaidAmount('');
      api.listProducts(search).then(setProducts);
    } catch (e) {
      setMessage('❌ ' + e.message);
    }
  }

  return (
    <div>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Sotuv (kassa)</h2>
      </div>

      {message && (
        <div className="card" style={{ marginBottom: 14, borderColor: message.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <div className="card">
          <input placeholder="Mahsulot qidirish..." value={search} onChange={(e) => search_(e.target.value)} style={{ marginBottom: 12 }} />
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            <table>
              <thead><tr><th>Nomi</th><th>Narx</th><th>Qoldiq</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{money(p.sale_price)}</td>
                    <td>{p.quantity}</td>
                    <td><button className="btn secondary" disabled={p.quantity <= 0} onClick={() => addToCart(p)}>+ Qo'shish</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Savat</h3>
          {cart.length === 0 && <div style={{ color: 'var(--text-dim)' }}>Savat bo'sh</div>}
          {cart.map((it) => (
            <div key={it.product_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: 14 }}>{it.product_name}</div>
              <input
                type="number"
                style={{ width: 60 }}
                value={it.quantity}
                max={it.max}
                onChange={(e) => updateQty(it.product_id, +e.target.value)}
              />
              <div style={{ width: 90, fontSize: 13, textAlign: 'right' }}>{money(it.quantity * it.unit_price)}</div>
              <button className="btn danger" style={{ padding: '6px 10px' }} onClick={() => removeItem(it.product_id)}>✕</button>
            </div>
          ))}

          <hr style={{ borderColor: 'var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, margin: '10px 0' }}>
            <span>Jami:</span><span>{money(total)}</span>
          </div>

          <div className="form-row">
            <label>Mijoz (ixtiyoriy)</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Tanlanmagan</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => handleCheckout('naqd')} disabled={cart.length === 0}>💵 Naqd</button>
            <button className="btn" style={{ flex: 1 }} onClick={() => handleCheckout('karta')} disabled={cart.length === 0}>💳 Karta</button>
          </div>

          <div className="form-row" style={{ marginTop: 12 }}>
            <label>Qarzga sotish — to'langan summa</label>
            <input type="number" placeholder="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
            <button className="btn secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => handleCheckout('qarz')} disabled={cart.length === 0 || !customerId}>
              📒 Qarzga yozish
            </button>
            {!customerId && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Qarzga sotish uchun mijoz tanlang</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
