import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [grading, setGrading] = useState({});
  const [grades, setGrades] = useState({});

  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    api.get('/teacher/students').then(res => setStudents(res.data)).finally(() => setLoading(false));
  }, []);

  const viewStudent = async (student) => {
    setSelected(student);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/teacher/students/${student.id}`);
      setDetail(res.data);
      const initGrades = {};
      res.data.submissions?.forEach(s => {
        initGrades[s.id] = { grade: s.grade || '', feedback: s.feedback || '' };
      });
      setGrades(initGrades);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGrade = async (submissionId) => {
    setGrading(prev => ({ ...prev, [submissionId]: true }));
    try {
      await api.put(`/submissions/${submissionId}/grade`, {
        grade: parseInt(grades[submissionId]?.grade),
        feedback: grades[submissionId]?.feedback
      });
      const res = await api.get(`/teacher/students/${selected.id}`);
      setDetail(res.data);
      alert('تم حفظ الدرجة بنجاح ✓');
    } catch (err) {
      alert('خطأ في الحفظ');
    } finally {
      setGrading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const getFileIcon = (url) => {
    if (!url) return '📄';
    if (url.endsWith('.pdf')) return '📕';
    if (url.match(/\.(doc|docx)$/)) return '📘';
    if (url.match(/\.(ppt|pptx)$/)) return '📙';
    return '📄';
  };

  const getFileName = (url) => {
    if (!url) return '';
    return url.split('/').pop();
  };

  const pct = (score, total) => total > 0 ? Math.round((score / total) * 100) : 0;

  if (loading) return <div className="loading">جاري التحميل...</div>;

  if (selected) {
    return (
      <div className="page" dir="rtl">
        <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); setDetail(null); }} style={{ marginBottom: 20 }}>
          → العودة لقائمة الطلاب
        </button>

        {loadingDetail ? <div className="loading">جاري التحميل...</div> : detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Student info */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#e0e7ff', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 20, flexShrink: 0
              }}>
                {detail.student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>{detail.student.name}</h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{detail.student.email}</p>
              </div>
            </div>

            {/* Exam results */}
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: 14 }}>📝 نتائج الامتحانات</h3>
              {detail.exam_attempts.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>لا توجد محاولات بعد</p>
              ) : (
                <table>
                  <thead>
                    <tr><th>الامتحان</th><th>النوع</th><th>النتيجة</th><th>التاريخ</th></tr>
                  </thead>
                  <tbody>
                    {detail.exam_attempts.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>{a.exam_title}</td>
                        <td>
                          <span className={`badge ${a.exam_type === 'pre' ? 'badge-blue' : a.exam_type === 'post' ? 'badge-green' : 'badge-amber'}`}>
                            {a.exam_type === 'pre' ? 'أولي' : a.exam_type === 'post' ? 'نهائي' : 'قصير'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: pct(a.score, a.total) >= 60 ? '#059669' : '#d97706' }}>
                            {pct(a.score, a.total)}%
                          </strong>
                          <span style={{ color: '#9ca3af', fontSize: 12, marginRight: 6 }}>({a.score}/{a.total})</span>
                        </td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(a.submitted_at).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Submissions */}
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: 14 }}>📋 المهام المُسلَّمة</h3>
              {detail.submissions.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>لا توجد مهام مسلمة بعد</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {detail.submissions.map(s => (
                    <div key={s.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: 16,
                      borderRight: s.grade != null ? '4px solid #059669' : '4px solid #d97706'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{s.assignment_title}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                            {new Date(s.submitted_at).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                        {s.grade != null ? (
                          <span className="badge badge-green">درجة: {s.grade}</span>
                        ) : (
                          <span className="badge badge-amber">لم تُصحَّح بعد</span>
                        )}
                      </div>

                      {/* File */}
                      {s.file_url && (
                        <div style={{ marginBottom: 12 }}>
                          <a
                            href={`${baseUrl}${s.file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 16px',
                              background: '#f3f4f6',
                              borderRadius: 8,
                              fontSize: 13,
                              color: '#374151',
                              textDecoration: 'none',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <span style={{ fontSize: 20 }}>{getFileIcon(s.file_url)}</span>
                            <span>{getFileName(s.file_url)}</span>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>— فتح / تحميل</span>
                          </a>
                        </div>
                      )}

                      {/* Text answer */}
                      {s.text_answer && (
                        <div style={{
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 13,
                          color: '#374151',
                          marginBottom: 12,
                          lineHeight: 1.6
                        }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>ملاحظات الطالب:</div>
                          {s.text_answer}
                        </div>
                      )}

                      {/* Grade form */}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ margin: 0, minWidth: 100 }}>
                          <label style={{ fontSize: 12 }}>الدرجة (من 100)</label>
                          <input
                            type="number"
                            min="0" max="100"
                            value={grades[s.id]?.grade || ''}
                            onChange={e => setGrades(prev => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value } }))}
                            style={{ width: 100 }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 200 }}>
                          <label style={{ fontSize: 12 }}>تعليق / ملاحظة</label>
                          <input
                            type="text"
                            placeholder="أضف تعليقك هنا..."
                            value={grades[s.id]?.feedback || ''}
                            onChange={e => setGrades(prev => ({ ...prev, [s.id]: { ...prev[s.id], feedback: e.target.value } }))}
                          />
                        </div>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleGrade(s.id)}
                          disabled={grading[s.id] || !grades[s.id]?.grade}
                          style={{ marginBottom: 1 }}
                        >
                          {grading[s.id] ? 'جاري الحفظ...' : '✓ حفظ الدرجة'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page" dir="rtl">
      <h1 className="page-title">الطلاب</h1>
      {students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <p>لا يوجد طلاب مسجلون بعد</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>الطالب</th><th>البريد الإلكتروني</th><th>الدروس المكتملة</th><th>الامتحانات</th><th></th></tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{s.email}</td>
                  <td>{s.completed_lessons}</td>
                  <td>{s.exam_attempts}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => viewStudent(s)}>عرض التفاصيل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
