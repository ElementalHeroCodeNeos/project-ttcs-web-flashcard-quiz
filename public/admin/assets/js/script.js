// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-button-menu");
if (buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const siderOverlay = document.querySelector(".sider-overlay");

  buttonMenuMobile.addEventListener("click", () => {
    sider.classList.add("active");
    siderOverlay.classList.add("active");
  });

  siderOverlay.addEventListener("click", () => {
    sider.classList.remove("active");
    siderOverlay.classList.remove("active");
  });
}
// End Menu Mobile

// Sider Active
const sider = document.querySelector(".sider");
if (sider) {
  const pathNameCurrent = window.location.pathname;
  const splitPathNameCurrent = pathNameCurrent.split("/");
  sider.querySelectorAll("a").forEach(item => {
    const href = item.href;
    if (href.startsWith("javascript")) return;
    const pathName = new URL(href).pathname;
    const splitPathName = pathName.split("/");
    if (splitPathNameCurrent[1] === splitPathName[1] && splitPathNameCurrent[2] === splitPathName[2]) {
      item.classList.add("active");
    }
  });
}
// End Sider Active

// Logout
const buttonLogout = document.querySelector(".sider .inner-logout");
if (buttonLogout) {
  buttonLogout.addEventListener("click", () => {
    window.location.href = "/logout";
  });
}
// End Logout

// Alert
const alertEl = document.querySelector("[alert-time]");
if (alertEl) {
  const time = parseInt(alertEl.getAttribute("alert-time")) || 4000;
  setTimeout(() => alertEl.remove(), time);
}
// End Alert

// Button Status (toggle active/inactive/locked)
document.querySelectorAll("[button-status]").forEach(button => {
  button.addEventListener("click", () => {
    const dataApi = button.getAttribute("data-api");
    fetch(dataApi, { method: "PATCH" })
      .then(res => res.json())
      .then(data => {
        if (data.code === "success" || data.code === "error") {
          window.location.reload();
        }
      });
  });
});
// End Button Status

// Filter Status
const filterStatus = document.querySelector("[filter-status]");
if (filterStatus) {
  const url = new URL(window.location.href);
  const valueCurrent = url.searchParams.get("status");
  if (valueCurrent) filterStatus.value = valueCurrent;

  filterStatus.addEventListener("change", () => {
    if (filterStatus.value) {
      url.searchParams.set("status", filterStatus.value);
    } else {
      url.searchParams.delete("status");
    }
    window.location.href = url.href;
  });
}
// End Filter Status

// Filter Category
const filterCategory = document.querySelector("[filter-category]");
if (filterCategory) {
  const url = new URL(window.location.href);
  const valueCurrent = url.searchParams.get("category_id");
  if (valueCurrent) filterCategory.value = valueCurrent;

  filterCategory.addEventListener("change", () => {
    if (filterCategory.value) {
      url.searchParams.set("category_id", filterCategory.value);
    } else {
      url.searchParams.delete("category_id");
    }
    window.location.href = url.href;
  });
}
// End Filter Category

// Filter Reset
const filterReset = document.querySelector("[filter-reset]");
if (filterReset) {
  filterReset.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.search = "";
    window.location.href = url.href;
  });
}
// End Filter Reset

// Search
const search = document.querySelector("[search]");
if (search) {
  const url = new URL(window.location.href);
  const valueCurrent = url.searchParams.get("keyword");
  if (valueCurrent) search.value = valueCurrent;

  search.addEventListener("keyup", (event) => {
    if (event.code === "Enter") {
      if (search.value.trim()) {
        url.searchParams.set("keyword", search.value.trim());
      } else {
        url.searchParams.delete("keyword");
      }
      window.location.href = url.href;
    }
  });
}
// End Search

// Pagination
const pagination = document.querySelector("[pagination]");
if (pagination) {
  const url = new URL(window.location.href);
  const valueCurrent = url.searchParams.get("page");
  if (valueCurrent) pagination.value = valueCurrent;

  pagination.addEventListener("change", () => {
    if (pagination.value) {
      url.searchParams.set("page", pagination.value);
    } else {
      url.searchParams.delete("page");
    }
    window.location.href = url.href;
  });
}
// End Pagination

// Avatar Preview
const avatarInput = document.querySelector("#avatar");
if (avatarInput) {
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;
    const preview = avatarInput.closest(".inner-upload-image").querySelector(".inner-upload-preview");
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="">`;
    };
    reader.readAsDataURL(file);
  });
}
// End Avatar Preview

// Category Create Form
const categoryCreateForm = document.querySelector("#category-create-form");
if (categoryCreateForm) {
  const validation = new JustValidate("#category-create-form");
  validation
    .addField("#name", [
      { rule: "required", errorMessage: "Vui lòng nhập tên danh mục!" }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const description = event.target.description.value;
      const position = event.target.position.value;
      const status = event.target.status.value;

      fetch("/admin/category/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, position, status })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === "success") {
            window.location.href = "/admin/category/list";
          } else {
            window.location.reload();
          }
        });
    });
}
// End Category Create Form

// Category Edit Form
const categoryEditForm = document.querySelector("#category-edit-form");
if (categoryEditForm) {
  const validation = new JustValidate("#category-edit-form");
  validation
    .addField("#name", [
      { rule: "required", errorMessage: "Vui lòng nhập tên danh mục!" }
    ])
    .onSuccess((event) => {
      const id = window.location.pathname.split("/").pop();
      const name = event.target.name.value;
      const description = event.target.description.value;
      const position = event.target.position.value;
      const status = event.target.status.value;

      fetch(`/admin/category/edit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, position, status })
      })
        .then(res => res.json())
        .then(data => { window.location.reload(); });
    });
}
// End Category Edit Form

// Profile Form
const profileForm = document.querySelector("#profile-form");
if (profileForm) {
  const validation = new JustValidate("#profile-form");
  validation
    .addField("#full_name", [
      { rule: "required", errorMessage: "Vui lòng nhập họ tên!" },
      { rule: "minLength", value: 2, errorMessage: "Họ tên phải có ít nhất 2 ký tự!" }
    ])
    .onSuccess((event) => {
      const full_name = event.target.full_name.value;
      const avatarFile = event.target.avatar?.files[0] || null;

      const formData = new FormData();
      formData.append("full_name", full_name);
      if (avatarFile) formData.append("avatar", avatarFile);

      fetch("/admin/profile", {
        method: "PATCH",
        body: formData
      })
        .then(res => res.json())
        .then(data => { window.location.reload(); });
    });
}
// End Profile Form

// Profile Change Password Form
const profileChangePasswordForm = document.querySelector("#profile-change-password-form");
if (profileChangePasswordForm) {
  const validation = new JustValidate("#profile-change-password-form");
  validation
    .addField("#currentPassword", [
      { rule: "required", errorMessage: "Vui lòng nhập mật khẩu hiện tại!" }
    ])
    .addField("#newPassword", [
      { rule: "required", errorMessage: "Vui lòng nhập mật khẩu mới!" },
      { rule: "minLength", value: 8, errorMessage: "Mật khẩu phải có ít nhất 8 ký tự!" }
    ])
    .addField("#confirmPassword", [
      { rule: "required", errorMessage: "Vui lòng xác nhận mật khẩu!" },
      {
        validator: (value, fields) => value === fields["#newPassword"].elem.value,
        errorMessage: "Mật khẩu xác nhận không khớp!"
      }
    ])
    .onSuccess((event) => {
      const currentPassword = event.target.currentPassword.value;
      const newPassword = event.target.newPassword.value;

      fetch("/admin/profile/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })
        .then(res => res.json())
        .then(data => { window.location.reload(); });
    });
}
// End Profile Change Password Form
