const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Teacher only' });
  next();
};

module.exports = { auth, teacherOnly };
