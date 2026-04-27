import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [preExam, setPreExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, preRes] = await Promise.all([
          api.get('/student/progress'),
          api.get('/exams/type/pre').catch(() => ({ data: null }))
        ]);
        setProgress(progRes.data);
        setPreExam(preRes.data);

        if (preRes.data) {
          const attempt = await api.get(`/exams/${preRes.data.id}/my-attempt`).catch(() => ({ data: null }));
          setPreExam(prev => ({ ...prev, attempt: attempt.data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  const hasPreTest = preExam?.attempt;
  const canAccessLessons = !preExam || hasPreTest;

  return (
    <div className="page" dir="rtl">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>أهلاً، {user?.name} 👋</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>تابع رحلتك التعليمية من هنا</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span className="stat-label">الدروس المكتملة</span>
          <span className="stat-value">{progress?.completed_lessons || 0}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>من {progress?.total_lessons || 0} درس</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">نسبة الإنجاز</span>
          <span className="stat-value" style={{ color: '#4f46e5' }}>{progress?.progress_percent || 0}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">الاختبارات القصيرة</span>
          <span className="stat-value">{progress?.quizzes?.length || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">الاختبار النهائي</span>
          <span className="stat-value" style={{ color: progress?.post_test ? '#059669' : '#d97706' }}>
            {progress?.post_test ? '✓ مكتمل' : 'لم يبدأ'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {progress?.total_lessons > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 500 }}>تقدم الكورس</span>
            <span style={{ color: '#4f46e5', fontWeight: 600 }}>{progress.progress_percent}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress.progress_percent}%` }} />
          </div>
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Step 1: Pre-test */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: hasPreTest ? '4px solid #059669' : '4px solid #4f46e5' }}>
          <div style={{ fontSize: 28 }}>{hasPreTest ? '✅' : '📝'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>الاختبار الأولي (Pre-test)</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {hasPreTest
                ? `أنهيت الاختبار — النتيجة: ${preExam.attempt.score}/${preExam.attempt.total}`
                : 'ابدأ هنا لقياس مستواك قبل الكورس'}
            </div>
          </div>
          {!hasPreTest && preExam && (
            <button className="btn btn-primary" onClick={() => navigate(`/student/exam/${preExam.id}`)}>
              ابدأ الاختبار
            </button>
          )}
          {!preExam && <span className="badge badge-amber">لا يوجد اختبار أولي</span>}
        </div>

        {/* Step 2: Lessons */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: `4px solid ${canAccessLessons ? '#4f46e5' : '#e5e7eb'}`, opacity: canAccessLessons ? 1 : 0.6 }}>
          <div style={{ fontSize: 28 }}>📖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>الدروس</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {canAccessLessons ? `${progress?.completed_lessons || 0} من ${progress?.total_lessons || 0} درس مكتمل` : 'أكمل الاختبار الأولي أولاً'}
            </div>
          </div>
          <button className="btn btn-secondary" disabled={!canAccessLessons} onClick={() => navigate('/student/lessons')}>
            {canAccessLessons ? 'تصفح الدروس' : '🔒 مقفل'}
          </button>
        </div>

        {/* Step 3: Post-test */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: progress?.post_test ? '4px solid #059669' : '4px solid #e5e7eb', opacity: progress?.progress_percent === 100 ? 1 : 0.6 }}>
          <div style={{ fontSize: 28 }}>{progress?.post_test ? '✅' : '🏆'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>الاختبار النهائي (Post-test)</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {progress?.post_test
                ? `نتيجتك: ${progress.post_test.score}/${progress.post_test.total}`
                : 'أكمل جميع الدروس لتفتح الاختبار النهائي'}
            </div>
          </div>
          {!progress?.post_test && progress?.progress_percent === 100 && (
            <button className="btn btn-primary" onClick={() => navigate('/student/post-test')}>
              ابدأ الاختبار
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
