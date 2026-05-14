const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../../models/user.model');

// Hiển thị trang đăng nhập
module.exports.login = (req, res) => {
  res.render('account/pages/login', { title: 'Đăng nhập' });
};

// Xử lý đăng nhập
module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  // Kiểm tra email tồn tại
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.json({ code: 'error', message: 'Email không tồn tại trong hệ thống!' });
  }

  // Xác thực mật khẩu
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.json({ code: 'error', message: 'Mật khẩu không đúng!' });
  }

  // Kiểm tra trạng thái tài khoản
  if (user.status !== 'active') {
    return res.json({ code: 'error', message: 'Tài khoản đã bị khóa!' });
  }

  // Tạo JWT, thời hạn 30 ngày nếu chọn ghi nhớ, ngược lại 1 ngày
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: rememberPassword ? '30d' : '1d' }
  );

  // Lưu token vào cookie
  res.cookie('token', token, {
    maxAge: rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  });

  // Redirect theo role
  const redirect = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
  res.json({ code: 'success', message: 'Đăng nhập thành công!', redirect });
};

// Hiển thị trang đăng ký
module.exports.register = (req, res) => {
  res.render('account/pages/register', { title: 'Đăng ký' });
};

// Xử lý đăng ký
module.exports.registerPost = async (req, res) => {
  const { fullName, email, password } = req.body;

  // Kiểm tra email đã tồn tại chưa
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.json({ code: 'error', message: 'Email đã được sử dụng!' });
  }

  // Mã hoá mật khẩu và tạo tài khoản
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  await User.create({ full_name: fullName, email, password_hash });

  res.json({ code: 'success', message: 'Đăng ký thành công!' });
};

// Xoá cookie và đăng xuất
module.exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
