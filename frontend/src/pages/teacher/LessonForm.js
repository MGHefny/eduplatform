import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

export default function LessonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ title: '', content: '', link_url: '', order_index: 0 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/lessons/${id}`).then(res => {
        const l = res.data;
        setForm({ title: l.title, content: l.content || '', link_url: l.link_url || '', order_index: l.order_index });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('link_url', form.link_url);
      formData.append('order_index', form.order_index);
      if (file) formData.append('file', file);

      if (isEdit) {
        await api.put(`/lessons/${id}`, formData);
      } else {
        await api.post('/lessons', formData);
      }
      navigate('/teacher/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 700 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/lessons')} style={{ marginBottom: 20 }}>
        → العودة
      </button>
      <h1 className="page-title">{isEdit ? 'تعديل الدرس' : 'إضافة درس جديد'}</h1>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>عنوان الدرس *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="أدخل عنوان الدرس" />
          </div>
          <div className="form-group">
            <label>الترتيب</label>
            <input type="number" value={form.order_index} onChange={e => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} min="0" />
          </div>
          <div className="form-group">
            <label>محتوى الدرس</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="اكتب محتوى الدرس هنا..." style={{ minHeight: 160 }} />
          </div>
          <div className="form-group">
            <label>رابط خارجي (اختياري)</label>
            <input type="url" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>ملف مرفق (اختياري)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>حجم أقصى 20MB</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة الدرس'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/teacher/lessons')}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
