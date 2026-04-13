---
description: Quy trình đăng nhập hệ thống
---

# Workflow Đăng Nhập Hệ Thống

Quy trình đăng nhập cho sinh viên và giảng viên vào hệ thống quản lý đồ án.

## Các bước thực hiện

1. **Kiểm tra thông tin đăng nhập**
   - Nhập email/username và mật khẩu
   - Validate định dạng email
   - Kiểm tra độ dài mật khẩu (tối thiểu 8 ký tự)

2. **Xác thực người dùng**
   - Truy vấn bảng `users` bằng email
   - So sánh mật khẩu đã hash (sử dụng bcrypt)
   - Kiểm tra trạng thái tài khoản (status = true)

3. **Kiểm tra vai trò người dùng**
   - Nếu user_id tồn tại trong bảng `students` → Vai trò: Sinh viên
   - Nếu user_id tồn tại trong bảng `instructors` → Vai trò: Giảng viên
   - Lấy thêm thông tin chi tiết từ bảng tương ứng

4. **Tạo JWT token**
   - Sử dụng JWT_SECRET từ .env
   - Thiết lập thời gian hết hạn theo JWT_EXPIRES_IN (7 ngày)
   - Payload chứa: user_id, role, email

5. **Trả về thông tin đăng nhập**
   - Token JWT
   - Thông tin người dùng (tên, mã sinh viên/giảng viên, vai trò)
   - Lần đăng nhập cuối cùng

## Bảng database liên quan

- `users`: Thông tin cơ bản người dùng
- `students`: Thông tin sinh viên
- `instructors`: Thông tin giảng viên

## Endpoint API

- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
