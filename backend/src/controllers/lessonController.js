const pool = require('../config/db');

const getLessons = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await pool.query('SELECT * FROM lessons WHERE id=$1', [id]);
    if (!lesson.rows.length) return res.status(404).json({ message: 'Not found' });

    const assignments = await pool.query('SELECT * FROM assignments WHERE lesson_id=$1', [id]);
    const exam = await pool.query('SELECT * FROM exams WHERE lesson_id=$1 AND type=$2', [id, 'lesson_quiz']);

    res.json({ ...lesson.rows[0], assignments: assignments.rows, quiz: exam.rows[0] || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createLesson = async (req, res) => {
  try {
    const { title, content, link_url, order_index } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO lessons (title, content, file_url, link_url, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, content, file_url, link_url, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, link_url, order_index } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const fields = ['title=$1', 'content=$2', 'link_url=$3', 'order_index=$4'];
    const values = [title, content, link_url, order_index];

    if (file_url) { fields.push(`file_url=$${values.length + 1}`); values.push(file_url); }
    values.push(id);

    const result = await pool.query(
      `UPDATE lessons SET ${fields.join(',')} WHERE id=$${values.length} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    await pool.query(
      `INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
       VALUES ($1,$2,true,NOW())
       ON CONFLICT (student_id, lesson_id) DO UPDATE SET completed=true, completed_at=NOW()`,
      [studentId, id]
    );
    res.json({ message: 'Marked complete' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLessons, getLesson, createLesson, updateLesson, deleteLesson, markComplete };
