const pool = require('../config/db');

const getExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await pool.query('SELECT * FROM exams WHERE id=$1', [id]);
    if (!exam.rows.length) return res.status(404).json({ message: 'Not found' });

    const questions = await pool.query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, order_index FROM questions WHERE exam_id=$1 ORDER BY order_index',
      [id]
    );
    res.json({ ...exam.rows[0], questions: questions.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getExamByType = async (req, res) => {
  try {
    const { type } = req.params;
    const exam = await pool.query('SELECT * FROM exams WHERE type=$1 AND lesson_id IS NULL', [type]);
    if (!exam.rows.length) return res.status(404).json({ message: 'No exam found' });

    const questions = await pool.query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, order_index FROM questions WHERE exam_id=$1 ORDER BY order_index',
      [exam.rows[0].id]
    );
    res.json({ ...exam.rows[0], questions: questions.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExam = async (req, res) => {
  try {
    const { title, type, lesson_id, questions } = req.body;
    const exam = await pool.query(
      'INSERT INTO exams (title, type, lesson_id) VALUES ($1,$2,$3) RETURNING *',
      [title, type, lesson_id || null]
    );
    const examId = exam.rows[0].id;

    if (questions && questions.length) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.query(
          'INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [examId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, i]
        );
      }
    }
    res.status(201).json(exam.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions } = req.body;

    await pool.query('UPDATE exams SET title=$1 WHERE id=$2', [title, id]);

    if (questions) {
      await pool.query('DELETE FROM questions WHERE exam_id=$1', [id]);
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.query(
          'INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, i]
        );
      }
    }
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    const existing = await pool.query('SELECT id FROM exam_attempts WHERE student_id=$1 AND exam_id=$2', [studentId, id]);
    if (existing.rows.length) return res.status(400).json({ message: 'Already submitted' });

    const questions = await pool.query('SELECT id, correct_option FROM questions WHERE exam_id=$1', [id]);
    let score = 0;
    const total = questions.rows.length;

    questions.rows.forEach(q => {
      if (answers[q.id] === q.correct_option) score++;
    });

    const result = await pool.query(
      'INSERT INTO exam_attempts (student_id, exam_id, score, total, answers) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [studentId, id, score, total, JSON.stringify(answers)]
    );
    res.json({ score, total, percentage: total > 0 ? Math.round((score / total) * 100) : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyAttempt = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exam_attempts WHERE student_id=$1 AND exam_id=$2',
      [req.user.id, req.params.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getExam, getExamByType, createExam, updateExam, submitExam, getMyAttempt };
