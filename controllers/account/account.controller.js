module.exports.login = (req, res) => {
  res.render('account/pages/login', { title: 'Đăng nhập' });
};

module.exports.register = (req, res) => {
  res.render('account/pages/register', { title: 'Đăng ký' });
};

module.exports.forgotPassword = (req, res) => {
  res.render('account/pages/forgot-password', { title: 'Quên mật khẩu' });
};

module.exports.otp = (req, res) => {
  res.render('account/pages/otp', { title: 'Xác nhận OTP' });
};

module.exports.resetPassword = (req, res) => {
  res.render('account/pages/reset-password', { title: 'Đặt lại mật khẩu' });
};

module.exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
