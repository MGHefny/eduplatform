const pool = require('../config/db');

const createAssignment = async (req, res) => {
  try {
    const { lesson_id, title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO assignments (lesson_id, title, description) VALUES ($1,$2,$3) RETURNING *',
      [lesson_id || null, title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text_answer } = req.body;
    const studentId = req.user.id;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;

    const existing = await pool.query('SELECT id FROM submissions WHERE student_id=$1 AND assignment_id=$2', [studentId, id]);
    if (existing.rows.length) return res.status(400).json({ message: 'Already submitted' });

    const result = await pool.query(
      'INSERT INTO submissions (student_id, assignment_id, file_url, text_answer) VALUES ($1,$2,$3,$4) RETURNING *',
      [studentId, id, file_url, text_answer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;
    const result = await pool.query(
      'UPDATE submissions SET grade=$1, feedback=$2 WHERE id=$3 RETURNING *',
      [grade, feedback, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignmentSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name as student_name, u.email as student_email
       FROM submissions s JOIN users u ON s.student_id=u.id
       WHERE s.assignment_id=$1 ORDER BY s.submitted_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAssignment, submitAssignment, gradeSubmission, getAssignmentSubmissions, deleteAssignment };
