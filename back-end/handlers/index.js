const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const token = req.headers['auth-token'];
  if (!token) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { isAuthenticated };
