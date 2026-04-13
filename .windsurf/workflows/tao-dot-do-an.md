---
description: Quy trình tạo đợt đồ án mới
---

# Workflow Tạo Đợt Đồ Án

Quy trình quản trị viên tạo đợt đồ án mới cho học kỳ.

## Các bước thực hiện

1. **Khởi tạo đợt đồ án**
   - Tạo bản ghi mới trong bảng `thesis_rounds`
   - Thiết lập các thông tin:
     - semester: Học kỳ (VD: 20241, 20242)
     - round_name: Tên đợt đồ án
     - start_date: Ngày bắt đầu
     - end_date: Ngày kết thúc
     - registration_deadline: Hạn đăng ký
     - status: "DRAFT" hoặc "ACTIVE"
     - faculty_id: Khoa
     - department_id: Bộ môn

2. **Thiết lập quy tắc mặc định**
   - Tạo bản ghi trong bảng `thesis_round_rules`
   - Cấu hình:
     - default_group_mode: "INDIVIDUAL" hoặc "GROUP"
     - default_min_members: Số thành viên tối thiểu
     - default_max_members: Số thành viên tối đa
     - registration_mode: Quy trình đăng ký

3. **Gán giảng viên vào đợt**
   - Tạo bản ghi trong bảng `instructor_assignments`
   - Cho từng giảng viên:
     - supervision_quota: Số lượng sinh viên có thể hướng dẫn
     - current_load: 0 (ban đầu)
     - thesis_round_id: Đợt đồ án vừa tạo

4. **Gán lớp học vào đợt**
   - Tạo bản ghi trong bảng `thesis_round_classes`
   - Chọn các lớp tham gia đợt đồ án
   - Liên kết với thesis_round_id

5. **Thiết lập quy trình hướng dẫn**
   - Tạo bản ghi trong bảng `guidance_processes`
   - Định nghĩa các giai đoạn:
     - week_number: Tuần thứ
     - phase_name: Tên giai đoạn
     - work_description: Mô tả công việc
     - expected_outcome: Kết quả mong đợi

6. **Cấp quyền truy cập cho sinh viên**
   - Tạo bản ghi trong bảng `student_thesis_rounds`
   - eligible: true/false
   - Cho sinh viên các lớp được chọn

7. **Kích hoạt đợt đồ án**
   - Cập nhật status = "ACTIVE"
   - Gửi thông báo cho giảng viên và sinh viên

## Bảng database liên quan

- `thesis_rounds`: Thông tin đợt đồ án
- `thesis_round_rules`: Quy tắc đợt đồ án
- `instructor_assignments`: Phân công giảng viên
- `thesis_round_classes`: Lớp tham gia
- `guidance_processes`: Quy trình hướng dẫn
- `student_thesis_rounds`: Sinh viên đủ điều kiện

## Endpoint API

- POST /api/admin/thesis-rounds
- PUT /api/admin/thesis-rounds/:id/activate
- POST /api/admin/thesis-rounds/:id/assign-instructors
- POST /api/admin/thesis-rounds/:id/assign-classes
