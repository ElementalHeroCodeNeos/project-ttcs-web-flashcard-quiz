const cloudinary = require('cloudinary').v2;  // Thư viện cloudinary: dùng để lưu trữ file (ảnh/ video) trên cloud
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Thư viện multer-storage-cloudinary: dùng để kết nối multer và cloudinary

// Multer: là 1 middlware dùng để tách file upload từ dữ liệu FormData trong req.body
// CloudinaryStorage: là 1 lớp để chỉ định tài khoản cloudinary mà multer sẽ upload file

cloudinary.config({ // Cấu hình tài khoản cloudinary
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports.storage = new CloudinaryStorage({  // Biến storage lưu thông tin tài khoản cloudinary muốn kết nối
  cloudinary: cloudinary, // Truyền thông tin tk cloudinary đã đăng ký (trên trang cloudinary.com)
});
