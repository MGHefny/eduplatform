import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api.get('/teacher/students').then(res => setStudents(res.data)).finally(() => setLoading(false));
  }, []);

  const viewStudent = async (student) => {
    setSelected(student);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/teacher/students/${student.id}`);
      setDetail(res.data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const pct = (score, total) => total > 0 ? Math.round((score / total) * 100) : 0;

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page" dir="rtl">
      <h1 className="page-title">الطلاب</h1>

      {selected ? (
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); setDetail(null); }} style={{ marginBottom: 20 }}>
            → العودة لقائمة الطلاب
          </button>

          {loadingDetail ? <div className="loading">جاري التحميل...</div> : detail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>{detail.student.name}</h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{detail.student.email}</p>
              </div>

              {/* Exam attempts */}
              <div className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 14 }}>نتائج الامتحانات</h3>
                {detail.exam_attempts.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>لا توجد محاولات بعد</p>
                ) : (
                  <table>
                    <thead><tr><th>الامتحان</th><th>النوع</th><th>النتيجة</th><th>التاريخ</th></tr></thead>
                    <tbody>
                      {detail.exam_attempts.map(a => (
                        <tr key={a.id}>
                          <td>{a.exam_title}</td>
                          <td><span className={`badge ${a.exam_type === 'pre' ? 'badge-blue' : a.exam_type === 'post' ? 'badge-green' : 'badge-amber'}`}>{a.exam_type}</span></td>
                          <td><strong>{pct(a.score, a.total)}%</strong> ({a.score}/{a.total})</td>
                          <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(a.submitted_at).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Submissions */}
              <div className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 14 }}>الواجبات المُسلَّمة</h3>
                {detail.submissions.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>لا توجد واجبات مسلمة</p>
                ) : (
                  <table>
                    <thead><tr><th>الواجب</th><th>الدرجة</th><th>التاريخ</th></tr></thead>
                    <tbody>
                      {detail.submissions.map(s => (
                        <tr key={s.id}>
                          <td>{s.assignment_title}</td>
                          <td>{s.grade != null ? <strong>{s.grade}</strong> : <span style={{ color: '#d97706' }}>لم تُصحَّح</span>}</td>
                          <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(s.submitted_at).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
