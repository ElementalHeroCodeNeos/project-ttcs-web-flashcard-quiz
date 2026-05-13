const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../../models/user.model');

// in-memory OTP store: { email -> { otp, expireAt } }
const otpStore = new Map();

module.exports.login = (req, res) => {
  res.render('account/pages/login', { title: 'Đăng nhập' });
};

module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.json({ code: 'error', message: 'Email không tồn tại trong hệ thống!' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.json({ code: 'error', message: 'Mật khẩu không đúng!' });
  }

  if (user.status !== 'active') {
    return res.json({ code: 'error', message: 'Tài khoản đã bị khóa!' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: rememberPassword ? '30d' : '1d' }
  );

  res.cookie('token', token, {
    maxAge: rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  });

  const redirect = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
  res.json({ code: 'success', message: 'Đăng nhập thành công!', redirect });
};

module.exports.register = (req, res) => {
  res.render('account/pages/register', { title: 'Đăng ký' });
};

module.exports.registerPost = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.json({ code: 'error', message: 'Email đã được sử dụng!' });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  await User.create({ full_name: fullName, email, password_hash });

  res.json({ code: 'success', message: 'Đăng ký thành công!' });
};

module.exports.forgotPassword = (req, res) => {
  res.render('account/pages/forgot-password', { title: 'Quên mật khẩu' });
};

module.exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.json({ code: 'error', message: 'Email không tồn tại trong hệ thống!' });
  }

  const existing = otpStore.get(email);
  if (existing && existing.expireAt > Date.now()) {
    return res.json({ code: 'error', message: 'Vui lòng gửi lại yêu cầu sau 5 phút!' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expireAt: Date.now() + 5 * 60 * 1000 });

  const mailHelper = require('../../helpers/mail.helper');
  const subject = 'Mã OTP lấy lại mật khẩu';
  const content = `Mã OTP của bạn là <b style="color:green">${otp}</b>. Có hiệu lực trong 5 phút, vui lòng không cung cấp cho bất kỳ ai.`;
  mailHelper.sendMail(email, subject, content);

  res.json({ code: 'success', message: 'Đã gửi mã OTP qua email!' });
};

module.exports.otp = (req, res) => {
  res.render('account/pages/otp', { title: 'Xác nhận OTP' });
};

module.exports.otpPost = async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore.get(email);
  if (!record || record.otp !== otp || record.expireAt < Date.now()) {
    return res.json({ code: 'error', message: 'Mã OTP không chính xác hoặc đã hết hạn!' });
  }

  otpStore.delete(email);

  const user = await User.findOne({ where: { email } });
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  });

  res.json({ code: 'success', message: 'Xác thực OTP thành công!' });
};

module.exports.resetPassword = (req, res) => {
  res.render('account/pages/reset-password', { title: 'Đặt lại mật khẩu' });
};

module.exports.resetPasswordPost = async (req, res) => {
  const { password } = req.body;
  const token = req.cookies.token;
  if (!token) return res.json({ code: 'error', message: 'Phiên đã hết hạn!' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  await User.update({ password_hash }, { where: { id: decoded.id } });

  res.json({ code: 'success', message: 'Đổi mật khẩu thành công!' });
};

module.exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
