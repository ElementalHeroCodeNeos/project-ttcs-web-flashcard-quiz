const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

module.exports.infoUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: { id: decoded.id, status: 'active' }
    });
    if (user) res.locals.user = user;
    next();
  } catch (error) {
    next();
  }
};
