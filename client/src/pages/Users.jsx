import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { full_name: '', username: '', password: '', role: 'kassir' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  function load() {
    api.listUsers().then(setUsers);
  }
  useEffect(load, []);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createUser(form);
      setModalOpen(false);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const roleLabel = { admin: 'Admin', kassir: 'Kassir', omborchi: 'Omborchi' };

  return (
    <div>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Xodimlar</h2>
        <button className="btn" onClick={() => setModalOpen(true)}>+ Yangi xodim</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Ism</th><th>Login</th><th>Rol</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.username}</td>
                <td><span className="badge orange">{roleLabel[u.role]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h3 style={{ marginTop: 0 }}>Yangi xodim qo'shish</h3>
            {error && <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', padding: 10, borderRadius: 8, marginBottom: 14 }}>{error}</div>}
            <div className="form-row"><label>To'liq ism *</label><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="form-row"><label>Login *</label><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div className="form-row"><label>Parol *</label><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="form-row">
              <label>Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="kassir">Kassir</option>
                <option value="omborchi">Omborchi</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Bekor qilish</button>
              <button className="btn" style={{ flex: 1 }}>Saqlash</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
