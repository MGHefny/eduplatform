const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, teacherOnly } = require('../middleware/auth');

const { register, login, me } = require('../controllers/authController');
const { getLessons, getLesson, createLesson, updateLesson, deleteLesson, markComplete } = require('../controllers/lessonController');
const { getExam, getExamByType, createExam, updateExam, submitExam, getMyAttempt } = require('../controllers/examController');
const { createAssignment, submitAssignment, gradeSubmission, getAssignmentSubmissions, deleteAssignment } = require('../controllers/assignmentController');
const { getDashboard, getStudentProgress, getAllStudents } = require('../controllers/teacherController');
const { getMyProgress } = require('../controllers/studentController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', auth, me);

// Lessons
router.get('/lessons', auth, getLessons);
router.get('/lessons/:id', auth, getLesson);
router.post('/lessons', auth, teacherOnly, upload.single('file'), createLesson);
router.put('/lessons/:id', auth, teacherOnly, upload.single('file'), updateLesson);
router.delete('/lessons/:id', auth, teacherOnly, deleteLesson);
router.post('/lessons/:id/complete', auth, markComplete);

// Exams
router.get('/exams/type/:type', auth, getExamByType);
router.get('/exams/:id', auth, getExam);
router.post('/exams', auth, teacherOnly, createExam);
router.put('/exams/:id', auth, teacherOnly, updateExam);
router.post('/exams/:id/submit', auth, submitExam);
router.get('/exams/:id/my-attempt', auth, getMyAttempt);

// Assignments
router.post('/assignments', auth, teacherOnly, createAssignment);
router.delete('/assignments/:id', auth, teacherOnly, deleteAssignment);
router.post('/assignments/:id/submit', auth, upload.single('file'), submitAssignment);
router.get('/assignments/:id/submissions', auth, teacherOnly, getAssignmentSubmissions);
router.put('/submissions/:id/grade', auth, teacherOnly, gradeSubmission);

// Teacher exams list
router.get('/teacher/exams', auth, teacherOnly, async (req, res) => {
  const pool = require('../config/db');
  try {
    const result = await pool.query(`
      SELECT e.*,
        COUNT(DISTINCT q.id) as questions_count,
        COUNT(DISTINCT ea.id) as attempts_count
      FROM exams e
      LEFT JOIN questions q ON q.exam_id = e.id
      LEFT JOIN exam_attempts ea ON ea.exam_id = e.id
      GROUP BY e.id ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/exams/:id', auth, teacherOnly, async (req, res) => {
  const pool = require('../config/db');
  try {
    await pool.query('DELETE FROM exams WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Teacher
router.get('/teacher/dashboard', auth, teacherOnly, getDashboard);
router.get('/teacher/students', auth, teacherOnly, getAllStudents);
router.get('/teacher/students/:studentId', auth, teacherOnly, getStudentProgress);

// Student
router.get('/student/progress', auth, getMyProgress);

module.exports = router;
