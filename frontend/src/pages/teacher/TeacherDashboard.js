import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page" dir="rtl">
      <h1 className="page-title">لوحة التحكم</h1>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span className="stat-label">إجمالي الطلاب</span>
          <span className="stat-value">{data?.stats?.total_students || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">عدد الدروس</span>
          <span className="stat-value">{data?.stats?.total_lessons || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">محاولات الامتحانات</span>
          <span className="stat-value">{data?.stats?.total_attempts || 0}</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent students */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600 }}>أحدث الطلاب</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/students')}>
              عرض الكل
            </button>
          </div>
          {data?.recent_students?.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>لا يوجد طلاب بعد</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data?.recent_students?.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: '#e0e7ff', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 13, flexShrink: 0
                  }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam stats */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>إحصائيات الامتحانات</h3>
          {data?.exam_stats?.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>لا توجد امتحانات بعد</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.exam_stats?.map((e, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {e.attempt_count} محاولة — متوسط {e.avg_score || 0}%
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${e.avg_score || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 14 }}>إجراءات سريعة</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/teacher/lessons/new')}>+ إضافة درس</button>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/exams/new')}>+ إضافة امتحان</button>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/students')}>👥 الطلاب</button>
        </div>
      </div>
    </div>
  );
}
