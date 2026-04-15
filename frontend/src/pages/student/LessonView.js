import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(res => {
        setLesson(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.post(`/lessons/${id}/complete`);
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (submitText) formData.append('text_answer', submitText);
      if (submitFile) formData.append('file', submitFile);
      await api.post(`/assignments/${assignmentId}/submit`, formData);
      setSubmitted(prev => ({ ...prev, [assignmentId]: true }));
      setSubmitText('');
      setSubmitFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!lesson) return <div className="page" dir="rtl"><div className="alert alert-error">الدرس غير موجود</div></div>;

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 800 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/lessons')} style={{ marginBottom: 20 }}>
        → العودة للدروس
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{lesson.title}</h1>

        {lesson.content && (
          <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
            {lesson.content}
          </div>
        )}

        {lesson.file_url && (
          <div style={{ marginBottom: 16 }}>
            <a href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}${lesson.file_url}`}
              target="_blank" rel="noreferrer" className="btn btn-secondary">
              📎 تحميل الملف المرفق
            </a>
          </div>
        )}

        {lesson.link_url && (
          <div style={{ marginBottom: 16 }}>
            <a href={lesson.link_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
              🔗 فتح الرابط
            </a>
          </div>
        )}

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, marginTop: 8 }}>
          {completed ? (
            <div className="alert alert-success">✓ تم تحديد هذا الدرس كمكتمل</div>
          ) : (
            <button className="btn btn-success" onClick={handleComplete} disabled={completing}>
              {completing ? 'جاري الحفظ...' : '✓ تحديد كمكتمل'}
            </button>
          )}
        </div>
      </div>

      {/* Quiz */}
      {lesson.quiz && (
        <div className="card" style={{ marginBottom: 20, borderRight: '4px solid #4f46e5' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>🧪 اختبار قصير</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>اختبر فهمك للدرس</p>
          <button className="btn btn-primary" onClick={() => navigate(`/student/exam/${lesson.quiz.id}`)}>
            ابدأ الاختبار
          </button>
        </div>
      )}

      {/* Assignments */}
      {lesson.assignments?.length > 0 && lesson.assignments.map(assignment => (
        <div key={assignment.id} className="card" style={{ marginBottom: 16, borderRight: '4px solid #d97706' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>📋 {assignment.title}</h3>
          {assignment.description && (
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 14 }}>{assignment.description}</p>
          )}
          {submitted[assignment.id] ? (
            <div className="alert alert-success">✓ تم إرسال الواجب بنجاح</div>
          ) : (
            <div>
              <div className="form-group">
                <label>إجابتك (نص)</label>
                <textarea
                  placeholder="اكتب إجابتك هنا..."
                  value={submitText}
                  onChange={e => setSubmitText(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>أو ارفع ملف</label>
                <input type="file" onChange={e => setSubmitFile(e.target.files[0])} />
              </div>
              <button className="btn btn-primary" onClick={() => handleSubmitAssignment(assignment.id)} disabled={submitting || (!submitText && !submitFile)}>
                {submitting ? 'جاري الإرسال...' : 'إرسال الواجب'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
