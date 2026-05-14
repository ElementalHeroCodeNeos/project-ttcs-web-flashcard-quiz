const express = require('express');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');
const cookieParser = require('cookie-parser');
const accountRoutes = require('./routes/account/index.route');
const adminRoutes = require('./routes/admin/index.route');
const clientRoutes = require('./routes/client/index.route');
const userMiddleware = require('./middlewares/client/user.middleware');

const app = express();
const port = 3000;

// Kết nối Database
sequelize.authenticate()
  .then(() => console.log('Kết nối database thành công'))
  .catch(err => console.error('Kết nối database thất bại:', err));

// Thiết lập views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// File tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Cho phép gửi data lên dạng json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse chuỗi cookie -> object và lưu ở req.cookies
app.use(cookieParser());

// Routes
app.use('/', accountRoutes);
app.use('/admin', adminRoutes);
app.use('/', userMiddleware.infoUser, clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
