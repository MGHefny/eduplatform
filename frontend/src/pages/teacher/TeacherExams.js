import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const EMPTY_QUESTION = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' };

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'pre', lesson_id: '' });
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION }]);
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await api.get('/teacher/exams');
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchExams();
    api.get('/lessons').then(res => setLessons(res.data));
  }, []);

  const resetForm = () => {
    setForm({ title: '', type: 'pre', lesson_id: '' });
    setQuestions([{ ...EMPTY_QUESTION }]);
    setEditingExam(null);
    setError('');
    setSuccess('');
  };

  const handleEdit = async (exam) => {
    setShowForm(true);
    setEditingExam(exam);
    setForm({ title: exam.title, type: exam.type, lesson_id: exam.lesson_id || '' });
    try {
      const res = await api.get(`/exams/${exam.id}`);
      setQuestions(res.data.questions.map(q => ({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option || 'a'
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (err) {
      alert('خطأ في الحذف');
    }
  };

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
      const payload = { ...form, lesson_id: form.lesson_id || null, questions };
      if (editingExam) {
        await api.put(`/exams/${editingExam.id}`, payload);
        setSuccess('تم تعديل الامتحان بنجاح!');
      } else {
        await api.post('/exams', payload);
        setSuccess('تم إنشاء الامتحان بنجاح!');
      }
      fetchExams();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = (type) => {
    if (type === 'pre') return { label: 'أولي', cls: 'badge-blue' };
    if (type === 'post') return { label: 'نهائي', cls: 'badge-green' };
    return { label: 'اختبار قصير', cls: 'badge-amber' };
  };

  if (showForm) {
    return (
      <div className="page" dir="rtl" style={{ maxWidth: 800 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); resetForm(); }} style={{ marginBottom: 20 }}>
          → العودة للامتحانات
        </button>
        <h1 className="page-title">{editingExam ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}</h1>
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
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, lesson_id: '' })}>
                  <option value="pre">أولي (Pre-test)</option>
                  <option value="post">نهائي (Post-test)</option>
                  <option value="lesson_quiz">اختبار قصير (Quiz)</option>
                </select>
              </div>
            </div>
            {form.type === 'lesson_quiz' && (
              <div className="form-group">
                <label>الدرس المرتبط</label>
                <select value={form.lesson_id} onChange={e => setForm({ ...form, lesson_id: e.target.value })}>
                  <option value="">— اختر درس —</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
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
                {loading ? 'جاري الحفظ...' : editingExam ? 'حفظ التعديلات' : 'إنشاء الامتحان'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page" dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>الامتحانات</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ إنشاء امتحان</button>
      </div>
      {loadingExams ? (
        <div className="loading">جاري التحميل...</div>
      ) : exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <p>لا توجد امتحانات بعد</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>+ إنشاء امتحان</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {exams.map(exam => {
            const { label, cls } = typeLabel(exam.type);
            const linkedLesson = lessons.find(l => l.id === exam.lesson_id);
            return (
              <div key={exam.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{exam.title}</span>
                    <span className={`badge ${cls}`}>{label}</span>
                  </div>
                  {linkedLesson && (
                    <div style={{ fontSize: 13, color: '#6b7280' }}>مرتبط بدرس: {linkedLesson.title}</div>
                  )}
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {exam.questions_count || 0} سؤال — {exam.attempts_count || 0} محاولة
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(exam)}>تعديل</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id)}>حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
