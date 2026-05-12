# FlashCard SRS — Web Học Thẻ Ghi Nhớ

Hệ thống hỗ trợ học và ghi nhớ kiến thức bằng phương pháp thẻ flashcard kết hợp thuật toán lặp lại ngắt quãng (Spaced Repetition System — SM-2).

Tham khảo: [AnkiWeb](https://ankiweb.net), [Quizlet](https://quizlet.com)

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js + Express |
| Template engine | Pug |
| Database | PostgreSQL |
| ORM | Sequelize |
| Package manager | Yarn |
| Auth | JWT (cookie) |
| Upload ảnh | Cloudinary |
| Gửi email | Nodemailer (Gmail SMTP) |

---

## Cài đặt & Chạy dự án

### 1. Clone và cài dependencies

```bash
git clone <repository-url>
cd project-web-flashcard
yarn install
```

### 2. Cấu hình biến môi trường

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị thực:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/web_flashcard"

JWT_SECRET="your_jwt_secret"

EMAIL_USERNAME="your_email@gmail.com"
EMAIL_PASSWORD="your_app_password"
EMAIL_SECURE="false"

CLOUDINARY_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### 3. Chạy server

```bash
yarn start
# hoặc
npm start
```

Truy cập: [http://localhost:3000](http://localhost:3000)

---

## Cấu trúc thư mục

```
project-web-flashcard/
├── config/
│   ├── database.js          # Kết nối Sequelize + PostgreSQL
│   └── variable.js          # Hằng số toàn cục
├── controllers/
│   ├── account/             # Đăng nhập, đăng ký, quên mật khẩu
│   ├── admin/               # Dashboard, user, deck, category
│   └── client/              # Dashboard, deck, card, study, quiz, explore, profile
├── helpers/
│   ├── cloudinary.helper.js # Upload ảnh lên Cloudinary
│   ├── mail.helper.js       # Gửi email OTP
│   └── generate.helper.js   # Tạo mã OTP ngẫu nhiên
├── middlewares/
│   ├── auth.middleware.js        # verifyToken(role) — dùng chung admin + client
│   ├── admin/setting.middleware.js
│   └── client/user.middleware.js # Inject thông tin user vào res.locals
├── models/                  # Sequelize models (PostgreSQL)
├── routes/
│   ├── account/             # /login, /register, /forgot-password, /otp, /reset-password
│   ├── admin/               # /admin/*
│   └── client/              # /dashboard, /deck/*, /explore/*, /profile/*
├── validates/               # Validate dữ liệu đầu vào
├── views/
│   ├── account/             # Layout + pages đăng nhập/đăng ký
│   ├── admin/               # Layout + pages admin panel
│   └── client/              # Layout + pages người dùng
├── public/
│   ├── account/assets/      # CSS + JS trang account
│   ├── admin/assets/        # CSS + JS admin panel
│   └── client/assets/       # CSS + JS client (bao gồm study.js, quiz-*.js)
├── .env.example
├── index.js                 # Entry point
└── package.json
```

---

## Tính năng

### Người dùng (User)
- Đăng ký / Đăng nhập / Quên mật khẩu (OTP qua email)
- Tạo, sửa, xóa bộ thẻ (deck) — Public hoặc Private
- Thêm, sửa, xóa thẻ (card) inline trong chi tiết deck
- **Học SRS**: lật thẻ + đánh giá Again / Hard / Good / Easy
- **Trắc nghiệm**: 4 đáp án, highlight đúng/sai
- **Quiz ghép cặp**: ghép mặt trước ↔ mặt sau
- Khám phá và lưu bộ thẻ công khai của người dùng khác
- Xem thống kê học tập (dashboard)

### Admin
- Quản lý tài khoản người dùng (khóa/mở khóa)
- Quản lý bộ thẻ công khai (ẩn/xóa vi phạm)
- Quản lý danh mục (tạo, sửa, xóa)

---

## Thuật toán SRS (SM-2 biến thể)

| Đánh giá | Hành động |
|---|---|
| **Again** | interval=1, repetitions=0, forget_count+1 → đẩy xuống cuối queue (không lưu DB) |
| **Hard** | interval×1.2, ease_factor-0.15 → đẩy xuống cuối queue (không lưu DB) |
| **Good** | SM-2 chuẩn, repetitions+1 → **lưu DB**, ra khỏi queue |
| **Easy** | interval×2, ease_factor+0.15 → **lưu DB**, ra khỏi queue |

`forget_count >= 3` → đánh dấu `is_hard = true`
