const pool = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role='student'");
    const lessons = await pool.query('SELECT COUNT(*) FROM lessons');
    const attempts = await pool.query('SELECT COUNT(*) FROM exam_attempts');

    const recentStudents = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE role='student' ORDER BY created_at DESC LIMIT 5"
    );

    const examStats = await pool.query(
      `SELECT e.title, e.type,
        COUNT(ea.id) as attempt_count,
        ROUND(AVG(ea.score::decimal / NULLIF(ea.total,0) * 100)) as avg_score
       FROM exams e LEFT JOIN exam_attempts ea ON e.id=ea.exam_id
       GROUP BY e.id, e.title, e.type ORDER BY e.type`
    );

    res.json({
      stats: {
        total_students: parseInt(students.rows[0].count),
        total_lessons: parseInt(lessons.rows[0].count),
        total_attempts: parseInt(attempts.rows[0].count)
      },
      recent_students: recentStudents.rows,
      exam_stats: examStats.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await pool.query('SELECT id, name, email FROM users WHERE id=$1', [studentId]);
    if (!student.rows.length) return res.status(404).json({ message: 'Not found' });

    const progress = await pool.query(
      `SELECT lp.*, l.title as lesson_title
       FROM lesson_progress lp JOIN lessons l ON lp.lesson_id=l.id
       WHERE lp.student_id=$1 ORDER BY l.order_index`,
      [studentId]
    );

    const attempts = await pool.query(
      `SELECT ea.*, e.title as exam_title, e.type as exam_type
       FROM exam_attempts ea JOIN exams e ON ea.exam_id=e.id
       WHERE ea.student_id=$1 ORDER BY ea.submitted_at DESC`,
      [studentId]
    );

    const submissions = await pool.query(
      `SELECT s.*, a.title as assignment_title
       FROM submissions s JOIN assignments a ON s.assignment_id=a.id
       WHERE s.student_id=$1 ORDER BY s.submitted_at DESC`,
      [studentId]
    );

    res.json({
      student: student.rows[0],
      lesson_progress: progress.rows,
      exam_attempts: attempts.rows,
      submissions: submissions.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed=true) as completed_lessons,
        COUNT(DISTINCT ea.id) as exam_attempts
       FROM users u
       LEFT JOIN lesson_progress lp ON u.id=lp.student_id
       LEFT JOIN exam_attempts ea ON u.id=ea.student_id
       WHERE u.role='student'
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getStudentProgress, getAllStudents };
