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
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [submitText, setSubmitText] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState({});
  const [fileError, setFileError] = useState('');

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const ALLOWED_EXT = '.pdf, .doc, .docx, .ppt, .pptx';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonRes = await api.get(`/lessons/${id}`);
        setLesson(lessonRes.data);

        const progressRes = await api.get('/student/progress');
        const prog = progressRes.data.lesson_progress?.find(p => p.lesson_id === id);
        if (prog?.completed) setCompleted(true);

        if (lessonRes.data.quiz) {
          const attemptRes = await api.get(`/exams/${lessonRes.data.quiz.id}/my-attempt`).catch(() => ({ data: null }));
          setQuizAttempt(attemptRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('يُسمح فقط بملفات PDF أو Word أو PowerPoint');
      setSubmitFile(null);
      e.target.value = '';
      return;
    }
    setFileError('');
    setSubmitFile(file);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!submitText && !submitFile) return;
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

  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 800 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/lessons')} style={{ marginBottom: 20 }}>
        → العودة للدروس
      </button>

      {/* Lesson content */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{lesson.title}</h1>

        {lesson.content && (
          <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
            {lesson.content}
          </div>
        )}

        {lesson.file_url && (
          <div style={{ marginBottom: 12 }}>
            <a href={`${baseUrl}${lesson.file_url}`} target="_blank" rel="noreferrer" className="btn btn-secondary">
              📎 تحميل الملف المرفق
            </a>
          </div>
        )}

        {lesson.link_url && (
          <div style={{ marginBottom: 12 }}>
            <a href={lesson.link_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
              🔗 فتح الرابط
            </a>
          </div>
        )}

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, marginTop: 8 }}>
          {completed ? (
            <div className="alert alert-success" style={{ margin: 0 }}>✓ تم تحديد هذا الدرس كمكتمل</div>
          ) : (
            <button className="btn btn-success" onClick={handleComplete} disabled={completing}>
              {completing ? 'جاري الحفظ...' : '✓ تحديد كمكتمل'}
            </button>
          )}
        </div>
      </div>

      {/* Quiz — يظهر فقط بعد الاكتمال */}
      {completed && lesson.quiz && (
        <div className="card" style={{ marginBottom: 16, borderRight: '4px solid #4f46e5' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>🧪 اختبار الدرس</h3>
          {quizAttempt ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>
                أديت الاختبار — نتيجتك: <strong>{quizAttempt.score}/{quizAttempt.total}</strong>
              </span>
              <span className="badge badge-green">✓ مكتمل</span>
            </div>
          ) : (
            <div>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>اختبر فهمك للدرس</p>
              <button className="btn btn-primary" onClick={() => navigate(`/student/exam/${lesson.quiz.id}`)}>
                ابدأ الاختبار
              </button>
            </div>
          )}
        </div>
      )}

      {/* Assignments — تظهر فقط بعد الاكتمال */}
      {completed && lesson.assignments?.length > 0 && lesson.assignments.map(assignment => (
        <div key={assignment.id} className="card" style={{ marginBottom: 16, borderRight: '4px solid #d97706' }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 4 }}>📋 {assignment.title}</h3>
            {assignment.description && (
              <p style={{ color: '#6b7280', fontSize: 14 }}>{assignment.description}</p>
            )}
          </div>

          {submitted[assignment.id] ? (
            <div className="alert alert-success" style={{ margin: 0 }}>✓ تم رفع المهمة بنجاح، في انتظار مراجعة المدرس</div>
          ) : (
            <div>
              {/* File upload box */}
              <div style={{
                border: '2px dashed #d97706',
                borderRadius: 10,
                padding: 24,
                textAlign: 'center',
                background: '#fffbeb',
                marginBottom: 14,
                cursor: 'pointer'
              }}
                onClick={() => document.getElementById(`file-${assignment.id}`).click()}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
                  {submitFile ? submitFile.name : 'اضغط لرفع ملف المهمة'}
                </div>
                <div style={{ fontSize: 12, color: '#b45309' }}>
                  PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx)
                </div>
                {submitFile && (
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-green">✓ {(submitFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
                <input
                  id={`file-${assignment.id}`}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {fileError && (
                <div className="alert alert-error" style={{ marginBottom: 12 }}>{fileError}</div>
              )}

              {/* Optional text answer */}
              <div className="form-group">
                <label>ملاحظات إضافية (اختياري)</label>
                <textarea
                  placeholder="يمكنك إضافة ملاحظات أو تعليق مع ملفك..."
                  value={submitText}
                  onChange={e => setSubmitText(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleSubmitAssignment(assignment.id)}
                disabled={submitting || (!submitText && !submitFile)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submitting ? 'جاري الرفع...' : '⬆ رفع المهمة'}
              </button>
            </div>
          )}
        </div>
      ))}

      {completed && !lesson.quiz && lesson.assignments?.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
          لا يوجد اختبار أو مهام لهذا الدرس
        </div>
      )}
    </div>
  );
}
