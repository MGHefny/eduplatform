const pool = require('../config/db');

const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const lessons = await pool.query('SELECT COUNT(*) FROM lessons');
    const totalLessons = parseInt(lessons.rows[0].count);

    const completed = await pool.query(
      'SELECT COUNT(*) FROM lesson_progress WHERE student_id=$1 AND completed=true',
      [studentId]
    );
    const completedLessons = parseInt(completed.rows[0].count);

    const preTest = await pool.query(
      `SELECT ea.score, ea.total FROM exam_attempts ea
       JOIN exams e ON ea.exam_id=e.id
       WHERE ea.student_id=$1 AND e.type='pre' LIMIT 1`,
      [studentId]
    );

    const postTest = await pool.query(
      `SELECT ea.score, ea.total FROM exam_attempts ea
       JOIN exams e ON ea.exam_id=e.id
       WHERE ea.student_id=$1 AND e.type='post' LIMIT 1`,
      [studentId]
    );

    const quizzes = await pool.query(
      `SELECT ea.score, ea.total, e.title FROM exam_attempts ea
       JOIN exams e ON ea.exam_id=e.id
       WHERE ea.student_id=$1 AND e.type='lesson_quiz'`,
      [studentId]
    );

    res.json({
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      pre_test: preTest.rows[0] || null,
      post_test: postTest.rows[0] || null,
      quizzes: quizzes.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProgress };
