const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports.verifyToken = (role) => async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: { id: decoded.id, email: decoded.email, status: 'active' }
    });

    if (!user) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    if (role && user.role !== role) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
};
