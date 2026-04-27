import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function StudentProgress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/progress')
      .then(res => setProgress(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  const pct = (score, total) => total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="page" dir="rtl">
      <h1 className="page-title">تقدمي</h1>

      {/* Overall */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span className="stat-label">الدروس المكتملة</span>
          <span className="stat-value">{progress?.completed_lessons || 0} / {progress?.total_lessons || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">نسبة الإنجاز</span>
          <span className="stat-value" style={{ color: '#4f46e5' }}>{progress?.progress_percent || 0}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">الاختبارات المنجزة</span>
          <span className="stat-value">{(progress?.quizzes?.length || 0) + (progress?.pre_test ? 1 : 0) + (progress?.post_test ? 1 : 0)}</span>
        </div>
      </div>

      {/* Pre test */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 14 }}>الاختبار الأولي</h3>
        {progress?.pre_test ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${pct(progress.pre_test.score, progress.pre_test.total)}%`, background: '#4f46e5' }} />
              </div>
            </div>
            <span style={{ fontWeight: 600, color: '#4f46e5', minWidth: 60, textAlign: 'left' }}>
              {pct(progress.pre_test.score, progress.pre_test.total)}%
            </span>
            <span style={{ color: '#6b7280', fontSize: 13 }}>{progress.pre_test.score}/{progress.pre_test.total}</span>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>لم تؤد الاختبار الأولي بعد</p>
        )}
      </div>

      {/* Quizzes */}
      {progress?.quizzes?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14 }}>الاختبارات القصيرة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {progress.quizzes.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#374151', minWidth: 140 }}>{q.title}</span>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${pct(q.score, q.total)}%`, background: '#059669' }} />
                  </div>
                </div>
                <span style={{ fontWeight: 600, color: '#059669', minWidth: 50, textAlign: 'left', fontSize: 13 }}>
                  {pct(q.score, q.total)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post test */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 14 }}>الاختبار النهائي</h3>
        {progress?.post_test ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${pct(progress.post_test.score, progress.post_test.total)}%`, background: '#059669' }} />
              </div>
            </div>
            <span style={{ fontWeight: 600, color: '#059669', minWidth: 60, textAlign: 'left' }}>
              {pct(progress.post_test.score, progress.post_test.total)}%
            </span>
            <span style={{ color: '#6b7280', fontSize: 13 }}>{progress.post_test.score}/{progress.post_test.total}</span>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>لم تؤد الاختبار النهائي بعد</p>
        )}
      </div>
    </div>
  );
}
