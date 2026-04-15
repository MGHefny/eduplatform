import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين');
    if (form.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 16 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>إنشاء حساب جديد</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>انضم وابدأ رحلتك التعليمية</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>الاسم الكامل</label>
              <input type="text" placeholder="اسمك هنا" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>كلمة المرور</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>تأكيد كلمة المرور</label>
              <input type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 500 }}>تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
