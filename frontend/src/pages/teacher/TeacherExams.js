import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const EMPTY_QUESTION = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' };

export default function TeacherExams() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', type: 'pre', lesson_id: '' });
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addQuestion = () => setQuestions(prev => [...prev, { ...EMPTY_QUESTION }]);

  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx));

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    for (const q of questions) {
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d)
        return setError('يرجى ملء جميع حقول الأسئلة');
    }
    setLoading(true);
    try {
      await api.post('/exams', { ...form, lesson_id: form.lesson_id || null, questions });
      setSuccess('تم إنشاء الامتحان بنجاح!');
      setForm({ title: '', type: 'pre', lesson_id: '' });
      setQuestions([{ ...EMPTY_QUESTION }]);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في الإنشاء');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 800 }}>
      <h1 className="page-title">إنشاء امتحان</h1>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>عنوان الامتحان *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="مثال: الاختبار الأولي" />
            </div>
            <div className="form-group">
              <label>نوع الامتحان *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="pre">أولي (Pre-test)</option>
                <option value="post">نهائي (Post-test)</option>
                <option value="lesson_quiz">اختبار قصير (Quiz)</option>
              </select>
            </div>
          </div>

          {form.type === 'lesson_quiz' && (
            <div className="form-group">
              <label>معرّف الدرس (اختياري)</label>
              <input type="text" value={form.lesson_id} onChange={e => setForm({ ...form, lesson_id: e.target.value })} placeholder="ID الدرس المرتبط" />
            </div>
          )}

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600 }}>الأسئلة ({questions.length})</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>+ إضافة سؤال</button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, color: '#4f46e5' }}>سؤال {idx + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(idx)}>حذف</button>
                  )}
                </div>

                <div className="form-group">
                  <label>نص السؤال</label>
                  <textarea value={q.question_text} onChange={e => updateQuestion(idx, 'question_text', e.target.value)} placeholder="اكتب السؤال هنا..." style={{ minHeight: 70 }} />
                </div>

                <div className="grid-2">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt} className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`correct_${idx}`} value={opt} checked={q.correct_option === opt} onChange={() => updateQuestion(idx, 'correct_option', opt)} />
                        الخيار {opt.toUpperCase()} {q.correct_option === opt && <span className="badge badge-green" style={{ fontSize: 11 }}>صحيح</span>}
                      </label>
                      <input type="text" value={q[`option_${opt}`]} onChange={e => updateQuestion(idx, `option_${opt}`, e.target.value)} placeholder={`الخيار ${opt.toUpperCase()}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'إنشاء الامتحان'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
