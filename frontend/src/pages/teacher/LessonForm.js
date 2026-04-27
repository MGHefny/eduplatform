import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

export default function LessonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ title: '', content: '', link_url: '', order_index: 0 });
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/lessons/${id}`).then(res => {
        const l = res.data;
        setForm({ title: l.title, content: l.content || '', link_url: l.link_url || '', order_index: l.order_index });
        if (l.assignments) setAssignments(l.assignments);
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

  const handleAddAssignment = async () => {
    if (!newAssignment.title.trim()) return alert('اكتب عنوان المهمة');
    if (!isEdit) return alert('احفظ الدرس أولاً قبل إضافة المهام');

    setLoadingAssignments(true);
    try {
      await api.post('/assignments', {
        lesson_id: id,
        title: newAssignment.title,
        description: newAssignment.description
      });
      const res = await api.get(`/lessons/${id}`);
      setAssignments(res.data.assignments || []);
      setNewAssignment({ title: '', description: '' });
    } catch (err) {
      alert('خطأ في إضافة المهمة');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    } catch (err) {
      alert('خطأ في الحذف');
    }
  };

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 700 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/lessons')} style={{ marginBottom: 20 }}>
        → العودة
      </button>
      <h1 className="page-title">{isEdit ? 'تعديل الدرس' : 'إضافة درس جديد'}</h1>

      {/* Lesson Form */}
      <div className="card" style={{ marginBottom: 20 }}>
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

      {/* Assignments Section - Only shown when editing */}
      {isEdit && (
        <div className="card" style={{ borderRight: '4px solid #d97706' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 المهام
            <span className="badge badge-amber">{assignments.length}</span>
          </h3>

          {/* Existing assignments */}
          {assignments.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {assignments.map(a => (
                <div key={a.id} style={{
                  border: '1px solid #fef3c7',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                  background: '#fffbeb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 3 }}>{a.title}</div>
                    {a.description && (
                      <div style={{ fontSize: 13, color: '#b45309' }}>{a.description}</div>
                    )}
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteAssignment(a.id)}
                    style={{ flexShrink: 0 }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new assignment */}
          <div style={{ borderTop: '1px solid #fef3c7', paddingTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>➕ إضافة مهمة جديدة</div>
            <div className="form-group">
              <label>عنوان المهمة *</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="مثال: حل التمرين 1"
              />
            </div>
            <div className="form-group">
              <label>وصف المهمة (اختياري)</label>
              <textarea
                value={newAssignment.description}
                onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="اكتب تفاصيل المهمة أو التعليمات للطالب..."
                style={{ minHeight: 80 }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAddAssignment}
              disabled={loadingAssignments || !newAssignment.title.trim()}
            >
              {loadingAssignments ? 'جاري الإضافة...' : '➕ إضافة المهمة'}
            </button>
          </div>

          <div style={{
            marginTop: 16,
            padding: 12,
            background: '#f0f9ff',
            borderRadius: 8,
            fontSize: 12,
            color: '#0369a1'
          }}>
            💡 <strong>ملاحظة:</strong> المهام تظهر للطالب فقط بعد تحديد الدرس كمكتمل. الطالب يرفع ملف PDF أو Word أو PowerPoint.
          </div>
        </div>
      )}

      {!isEdit && (
        <div className="card" style={{ textAlign: 'center', padding: 24, background: '#f9fafb', color: '#6b7280' }}>
          💡 احفظ الدرس أولاً لتتمكن من إضافة المهام
        </div>
      )}
    </div>
  );
}
