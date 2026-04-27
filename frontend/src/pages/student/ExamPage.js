import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const [examRes, attemptRes] = await Promise.all([
          api.get(`/exams/${id}`),
          api.get(`/exams/${id}/my-attempt`)
        ]);
        setExam(examRes.data);
        if (attemptRes.data) setAlreadyDone(attemptRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      alert('يرجى الإجابة على جميع الأسئلة');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/exams/${id}/submit`, { answers });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!exam) return <div className="page" dir="rtl"><div className="alert alert-error">الامتحان غير موجود</div></div>;

  if (alreadyDone) {
    const pct = alreadyDone.total > 0 ? Math.round((alreadyDone.score / alreadyDone.total) * 100) : 0;
    return (
      <div className="page" dir="rtl" style={{ maxWidth: 600 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 60 ? '🎉' : '📝'}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>لقد أجريت هذا الامتحان مسبقاً</h2>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#4f46e5', margin: '16px 0' }}>
            {pct}%
          </div>
          <p style={{ color: '#6b7280' }}>نتيجتك: {alreadyDone.score} من {alreadyDone.total}</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
            العودة
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="page" dir="rtl" style={{ maxWidth: 600 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 60 ? '🎉' : '💪'}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>انتهى الامتحان!</h2>
          <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 60 ? '#059669' : '#d97706', margin: '16px 0' }}>
            {pct}%
          </div>
          <p style={{ color: '#6b7280', fontSize: 16 }}>أجبت بشكل صحيح على {result.score} من أصل {result.total} سؤال</p>
          <div style={{ marginTop: 24 }}>
            <div className="progress-bar-wrap" style={{ height: 12, marginBottom: 24 }}>
              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 60 ? '#059669' : '#d97706' }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{exam.title}</h1>
        <span className="badge badge-blue">{answered}/{exam.questions.length} سؤال</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="card">
            <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>
              {idx + 1}. {q.question_text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['a', 'b', 'c', 'd'].map(opt => (
                <label key={opt} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1.5px solid ${answers[q.id] === opt ? '#4f46e5' : '#e5e7eb'}`,
                  background: answers[q.id] === opt ? '#e0e7ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    style={{ accentColor: '#4f46e5' }}
                  />
                  <span style={{ fontSize: 14 }}>{q[`option_${opt}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: 14 }}>
          {exam.questions.length - answered > 0
            ? `تبقى ${exam.questions.length - answered} سؤال`
            : 'جميع الأسئلة تمت الإجابة عليها ✓'}
        </span>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || answered < exam.questions.length}
        >
          {submitting ? 'جاري الإرسال...' : 'تسليم الامتحان'}
        </button>
      </div>
    </div>
  );
}
