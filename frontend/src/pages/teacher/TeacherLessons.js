import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function TeacherLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchLessons = () => {
    api.get('/lessons').then(res => setLessons(res.data)).finally(() => setLoading(false));
  };

  useEffect(fetchLessons, []);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    setDeleting(id);
    try {
      await api.delete(`/lessons/${id}`);
      fetchLessons();
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page" dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>الدروس</h1>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/lessons/new')}>+ إضافة درس</button>
      </div>

      {lessons.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <p>لا توجد دروس بعد. أضف أول درس!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/teacher/lessons/new')}>
            + إضافة درس
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#e0e7ff', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                {lesson.content && (
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                    {lesson.content.substring(0, 70)}{lesson.content.length > 70 ? '...' : ''}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {lesson.file_url && <span className="badge badge-blue">📎 ملف</span>}
                  {lesson.link_url && <span className="badge badge-blue">🔗 رابط</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/lessons/edit/${lesson.id}`)}>
                  تعديل
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lesson.id)} disabled={deleting === lesson.id}>
                  {deleting === lesson.id ? '...' : 'حذف'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
