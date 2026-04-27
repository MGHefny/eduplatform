import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function StudentLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          api.get('/lessons'),
          api.get('/student/progress')
        ]);
        setLessons(lessonsRes.data);
        const prog = {};
        progressRes.data.lesson_progress?.forEach(p => { prog[p.lesson_id] = p.completed; });
        setProgress(prog);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page" dir="rtl">
      <h1 className="page-title">الدروس</h1>

      {lessons.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          لا توجد دروس بعد
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lessons.map((lesson, idx) => {
            const completed = progress[lesson.id];
            const prevCompleted = idx === 0 || progress[lessons[idx - 1]?.id];
            const locked = !prevCompleted && idx > 0;

            return (
              <div key={lesson.id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 16,
                borderRight: `4px solid ${completed ? '#059669' : locked ? '#e5e7eb' : '#4f46e5'}`,
                opacity: locked ? 0.6 : 1,
                cursor: locked ? 'not-allowed' : 'pointer'
              }}
                onClick={() => !locked && navigate(`/student/lessons/${lesson.id}`)}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: completed ? '#d1fae5' : locked ? '#f3f4f6' : '#e0e7ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16,
                  color: completed ? '#059669' : locked ? '#9ca3af' : '#4f46e5',
                  flexShrink: 0
                }}>
                  {completed ? '✓' : locked ? '🔒' : idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{lesson.title}</div>
                  {lesson.content && (
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                      {lesson.content.substring(0, 80)}{lesson.content.length > 80 ? '...' : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {lesson.file_url && <span className="badge badge-blue">📎 ملف</span>}
                    {lesson.link_url && <span className="badge badge-blue">🔗 رابط</span>}
                    {completed && <span className="badge badge-green">✓ مكتمل</span>}
                  </div>
                </div>
                {!locked && (
                  <div style={{ color: '#9ca3af', fontSize: 18 }}>←</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
