# FlashCard SRS — Web Học Thẻ Ghi Nhớ

Hệ thống hỗ trợ học và ghi nhớ kiến thức bằng phương pháp thẻ flashcard kết hợp thuật toán lặp lại ngắt quãng (Spaced Repetition System — SM-2).

Tham khảo: [AnkiWeb](https://ankiweb.net), [Quizlet](https://quizlet.com)

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Mô hình | MVC |
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
```

Truy cập: [http://localhost:3000](http://localhost:3000)

---

## Cấu trúc thư mục

```
project-web-flashcard/
├── config/
│   ├── database.js               # Sequelize + PostgreSQL connection
│   └── variable.js               # pathAdmin, quiz types, rating keys
├── controllers/
│   ├── account/
│   │   └── account.controller.js # login, register, forgot password
│   ├── admin/
│   │   ├── dashboard.controller.js
│   │   ├── user.controller.js
│   │   ├── deck.controller.js
│   │   └── category.controller.js
│   └── client/
│       ├── dashboard.controller.js
│       ├── deck.controller.js
│       ├── card.controller.js
│       ├── study.controller.js
│       ├── quiz.controller.js
│       ├── explore.controller.js
│       └── profile.controller.js
├── middlewares/
│   ├── auth.middleware.js         # verifyToken dùng chung admin + client
│   ├── admin/
│   │   └── setting.middleware.js
│   └── client/
│       ├── setting.middleware.js
│       └── user.middleware.js     # inject thông tin user vào res.locals
├── models/
│   ├── user.model.js
│   ├── category.model.js
│   ├── deck.model.js
│   ├── card.model.js
│   ├── savedDeck.model.js
│   ├── studyProgress.model.js
│   ├── reviewLog.model.js
│   ├── quizAttempt.model.js
│   └── quizAttemptItem.model.js
├── routes/
│   ├── account/
│   │   ├── index.route.js
│   │   └── account.route.js      # /login, /register, /logout, /forgot-password
│   ├── admin/
│   │   ├── index.route.js
│   │   ├── dashboard.route.js
│   │   ├── user.route.js
│   │   ├── deck.route.js
│   │   └── category.route.js
│   └── client/
│       ├── index.route.js
│       ├── dashboard.route.js
│       ├── deck.route.js         # /deck/* bao gồm cả study và quiz
│       ├── explore.route.js
│       └── profile.route.js
├── validates/
│   ├── account/
│   │   └── account.validate.js
│   ├── admin/
│   └── client/
├── views/
│   ├── account/
│   │   ├── layouts/
│   │   │   └── account.pug
│   │   └── pages/
│   │       ├── login.pug
│   │       ├── register.pug
│   │       ├── forgot-password.pug
│   │       ├── otp.pug
│   │       └── reset-password.pug
│   ├── admin/
│   │   ├── layouts/default.pug
│   │   ├── partials/ (header.pug, sider.pug)
│   │   └── pages/ (dashboard, user-list, deck-list, category-*)
│   └── client/
│       ├── layouts/default.pug
│       ├── partials/ (header.pug, footer.pug)
│       ├── mixins/               # deck-card.pug bỏ (inline); pagination.pug defer Phase 3
│       └── pages/
│           ├── home.pug
│           ├── dashboard.pug
│           ├── deck-list.pug
│           ├── deck-create.pug
│           ├── deck-edit.pug
│           ├── deck-detail.pug
│           ├── study.pug
│           ├── quiz-choice.pug
│           ├── quiz-match.pug
│           ├── quiz-result.pug   # dùng chung cho cả choice lẫn match
│           ├── explore.pug
│           ├── explore-detail.pug
│           └── profile.pug
├── public/
│   ├── account/assets/
│   ├── admin/assets/
│   └── client/assets/
│       ├── css/
│       ├── images/
│       └── js/
│           ├── study.js          # flip card + SM-2 queue logic
│           ├── quiz-choice.js    # highlight đúng/sai
│           └── quiz-match.js     # ghép cặp form-style, color-coded pairs
├── helpers/
│   ├── cloudinary.helper.js
│   ├── mail.helper.js
│   └── generate.helper.js
├── schema.sql                    # DDL tạo bảng PostgreSQL
├── seed.sql                      # Dữ liệu mẫu
├── .env.example
└── index.js
```

---

## Routes

### Client

| Method | Route | Mô tả | Auth |
|--------|-------|--------|------|
| GET | / | Landing page — đã đăng nhập redirect → /dashboard | Tất cả |
| GET | /login | Trang đăng nhập | Guest |
| POST | /login | Xử lý đăng nhập | Guest |
| GET | /register | Trang đăng ký | Guest |
| POST | /register | Xử lý đăng ký | Guest |
| GET | /logout | Đăng xuất | — |
| GET | /dashboard | Trang chủ user | User |
| GET | /deck | Danh sách bộ thẻ | User |
| GET | /deck/create | Form tạo bộ thẻ | User |
| POST | /deck/create | Tạo bộ thẻ | User |
| GET | /deck/edit/:id | Form sửa bộ thẻ | User (owner) |
| POST | /deck/edit/:id | Cập nhật bộ thẻ | User (owner) |
| DELETE | /deck/delete/:id | Xóa bộ thẻ | User (owner) |
| GET | /deck/detail/:id | Chi tiết bộ thẻ + thẻ | User |
| POST | /deck/detail/:id/card | Thêm thẻ inline | User (owner) |
| PATCH | /deck/detail/:id/card/:cid | Sửa thẻ inline | User (owner) |
| DELETE | /deck/detail/:id/card/:cid | Xóa thẻ | User (owner) |
| POST | /deck/:id/save | Lưu public deck vào thư viện | User |
| GET | /study | Học tất cả thẻ đến hạn (SRS review) | User |
| GET | /deck/study/:id | Học tất cả thẻ trong bộ (tự do) | User |
| PATCH | /study/rate | Lưu kết quả Good/Easy vào study_progress | User |
| GET | /deck/quiz/choice/:id | Trắc nghiệm 4 đáp án | User |
| POST | /deck/quiz/choice/:id | Nộp kết quả trắc nghiệm | User |
| GET | /deck/quiz/match/:id | Quiz ghép cặp | User |
| POST | /deck/quiz/match/:id | Nộp kết quả ghép cặp | User |
| GET | /deck/quiz/result/:attemptId | Kết quả quiz (dùng chung) | User |
| GET | /explore | Khám phá public decks | Guest + User |
| GET | /explore/:id | Chi tiết public deck | Guest + User |
| GET | /profile | Hồ sơ cá nhân | User |
| POST | /profile/edit | Cập nhật họ tên + ảnh đại diện | User |

### Admin

| Method | Route | Mô tả |
|--------|-------|--------|
| GET | /admin/dashboard | Thống kê hệ thống |
| GET | /admin/user/list | Danh sách user |
| PATCH | /admin/user/:id/status | Khóa/mở khóa tài khoản |
| GET | /admin/deck/list | Danh sách public decks |
| PATCH | /admin/deck/:id/hide | Ẩn deck vi phạm |
| DELETE | /admin/deck/:id | Xóa deck vi phạm |
| GET | /admin/category/list | Danh sách danh mục |
| GET | /admin/category/create | Form tạo danh mục |
| POST | /admin/category/create | Tạo danh mục |
| GET | /admin/category/edit/:id | Form sửa danh mục |
| POST | /admin/category/edit/:id | Cập nhật danh mục |
| DELETE | /admin/category/delete/:id | Xóa danh mục |

---

## Tiến độ

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| Phase 1 | Setup + Auth (login, register, forgot password) | ✅ Xong |
| Phase 2 | Client views (13 trang) + Client JS | ✅ Xong |
| Phase 3 | Admin views (6 trang) | ⬜ Chưa bắt đầu |
| Phase 4 | Client JS (study, quiz-choice, quiz-match) | ✅ Xong |
| Phase 5 | Models + Client controllers (POST/PATCH/DELETE) | ✅ Xong |
| Phase 6 | Admin controllers | ⬜ Chưa bắt đầu |

---

## Thuật toán SRS (SM-2 biến thể)

Field theo dõi trong bảng `study_progress`: `repetitions`, `interval_days`, `ease_factor`, `due_date`, `lapse_count`, `is_difficult`

```
Again:
  interval_days = 1
  repetitions   = 0
  lapse_count  += 1
  if lapse_count >= 3 → is_difficult = true
  → KHÔNG lưu DB, đẩy thẻ xuống cuối queue

Hard:
  interval_days = round(interval_days * 1.2)
  ease_factor   = max(1.3, ease_factor - 0.15)
  → KHÔNG lưu DB, đẩy thẻ xuống cuối queue

Good:
  if repetitions == 0 → interval_days = 1
  if repetitions == 1 → interval_days = 6
  else                → interval_days = round(interval_days * ease_factor)
  repetitions += 1
  → LƯU DB (PATCH /study/rate), thẻ ra khỏi queue

Easy:
  interval_days = round(max(interval_days, 1) * 2)
  ease_factor   = min(3.5, ease_factor + 0.15)
  repetitions  += 1
  → LƯU DB (PATCH /study/rate), thẻ ra khỏi queue

due_date = CURRENT_DATE + interval_days
```
