// Login Form
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  const validation = new JustValidate('#login-form');

  validation
    .addField('#email', [
      { rule: 'required', errorMessage: 'Vui lòng nhập email!' },
      { rule: 'email', errorMessage: 'Email không đúng định dạng!' },
    ])
    .addField('#password', [
      { rule: 'required', errorMessage: 'Vui lòng nhập mật khẩu!' },
      { validator: (value) => value.length >= 8, errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!' },
    ])
    .onSuccess((event) => {
      const dataFinal = {
        email: event.target.email.value,
        password: event.target.password.value,
        rememberPassword: event.target.rememberPassword.checked
      };

      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') alert(data.message);
          if (data.code === 'success') window.location.href = data.redirect;
        });
    });
}

// Register Form
const registerForm = document.querySelector("#register-form");
if (registerForm) {
  const validation = new JustValidate('#register-form');

  validation
    .addField('#fullName', [
      { rule: 'required', errorMessage: 'Vui lòng nhập họ tên!' },
      { rule: 'minLength', value: 5, errorMessage: 'Họ tên phải có ít nhất 5 ký tự!' },
    ])
    .addField('#email', [
      { rule: 'required', errorMessage: 'Vui lòng nhập email!' },
      { rule: 'email', errorMessage: 'Email không đúng định dạng!' },
    ])
    .addField('#password', [
      { rule: 'required', errorMessage: 'Vui lòng nhập mật khẩu!' },
      { validator: (value) => value.length >= 8, errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!' },
      { validator: (value) => /[A-Z]/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một chữ in hoa!' },
      { validator: (value) => /[a-z]/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một chữ thường!' },
      { validator: (value) => /\d/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!' },
      { validator: (value) => /[@$!%*?&]/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!' },
    ])
    .onSuccess((event) => {
      const dataFinal = {
        fullName: event.target.fullName.value,
        email: event.target.email.value,
        password: event.target.password.value
      };

      fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') alert(data.message);
          if (data.code === 'success') window.location.href = '/login';
        });
    });
}

// Forgot Password Form
const forgotPasswordForm = document.querySelector("#forgot-password-form");
if (forgotPasswordForm) {
  const validation = new JustValidate('#forgot-password-form');

  validation
    .addField('#email', [
      { rule: 'required', errorMessage: 'Vui lòng nhập email!' },
      { rule: 'email', errorMessage: 'Email không đúng định dạng!' },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;

      fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') alert(data.message);
          if (data.code === 'success') window.location.href = `/otp?email=${email}`;
        });
    });
}

// OTP Form
const otpForm = document.querySelector("#otp-form");
if (otpForm) {
  const validation = new JustValidate('#otp-form');

  validation
    .addField('#otp', [
      { rule: 'required', errorMessage: 'Vui lòng nhập mã OTP!' },
    ])
    .onSuccess((event) => {
      const otp = event.target.otp.value;
      const email = new URLSearchParams(window.location.search).get('email');

      fetch('/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, email })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') alert(data.message);
          if (data.code === 'success') window.location.href = '/reset-password';
        });
    });
}

// Reset Password Form
const resetPasswordForm = document.querySelector("#reset-password-form");
if (resetPasswordForm) {
  const validation = new JustValidate('#reset-password-form');

  validation
    .addField('#password', [
      { rule: 'required', errorMessage: 'Vui lòng nhập mật khẩu!' },
      { validator: (value) => value.length >= 8, errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!' },
      { validator: (value) => /[A-Z]/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một chữ in hoa!' },
      { validator: (value) => /[a-z]/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một chữ thường!' },
      { validator: (value) => /\d/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!' },
      { validator: (value) => /[@$!%*?&]/.test(value), errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!' },
    ])
    .addField('#confirm-password', [
      { rule: 'required', errorMessage: 'Vui lòng xác nhận mật khẩu!' },
      {
        validator: (value, fields) => value === fields['#password'].elem.value,
        errorMessage: 'Mật khẩu xác nhận không khớp!'
      }
    ])
    .onSuccess((event) => {
      fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: event.target.password.value })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') alert(data.message);
          if (data.code === 'success') window.location.href = '/login';
        });
    });
}
