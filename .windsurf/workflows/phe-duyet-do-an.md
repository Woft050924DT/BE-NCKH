---
description: Quy trình phê duyệt đồ án
---

# Workflow Phê Duyệt Đồ Án

Quy trình giảng viên và trưởng bộ môn phê duyệt đề tài đồ án.

## Các bước thực hiện

### 1. Giảng viên đề xuất đề tài

1. **Tạo đề tài đề xuất**
   - Tạo bản ghi trong bảng `proposed_topics`
   - Thiết lập thông tin:
     - topic_code: Mã đề tài
     - topic_title: Tên đề tài
     - topic_description: Mô tả chi tiết
     - objectives: Mục tiêu
     - student_requirements: Yêu cầu sinh viên
     - technologies_used: Công nghệ sử dụng
     - instructor_id: Giảng viên đề xuất
     - thesis_round_id: Đợt đồ án
     - status: true (hoạt động)

2. **Thiết lập quy tắc đề tài**
   - Tạo bản ghi trong bảng `proposed_topic_rules`
   - Cấu hình:
     - group_mode: "INDIVIDUAL", "GROUP", hoặc "BOTH"
     - min_members: Số thành viên tối thiểu
     - max_members: Số thành viên tối đa
     - reason: Lý do quy định

### 2. Sinh viên đăng ký đề tài

1. **Tạo đăng ký đề tài**
   - Tạo bản ghi trong bảng `topic_registrations`
   - Thiết lập:
     - thesis_group_id: Nhóm đồ án (nếu có)
     - thesis_round_id: Đợt đồ án
     - instructor_id: Giảng viên hướng dẫn
     - proposed_topic_id: Đề tài đăng ký (nếu chọn đề tài có sẵn)
     - self_proposed_title: Tên đề tài tự đề xuất (nếu có)
     - self_proposed_description: Mô tả đề tài tự đề xuất
     - selection_reason: Lý do chọn
     - registration_date: Ngày đăng ký
     - instructor_status: "PENDING"
     - head_status: "PENDING"

2. **Gửi thông báo**
   - Thông báo cho giảng viên hướng dẫn
   - Thông báo cho trưởng bộ môn

### 3. Giảng viên duyệt đề tài

1. **Kiểm tra đăng ký**
   - Xem thông tin đăng ký từ bảng `topic_registrations`
   - Kiểm tra lịch sử sinh viên
   - Kiểm tra số lượng sinh viên hiện tại (current_load)

2. **Phê duyệt hoặc từ chối**
   - Cập nhật `instructor_status`:
     - "APPROVED": Được duyệt
     - "REJECTED": Bị từ chối
   - Nếu từ chối:
     - `instructor_rejection_reason`: Lý do từ chối
   - Nếu được duyệt:
     - `instructor_approval_date`: Ngày duyệt

### 4. Trưởng bộ môn duyệt đề tài

1. **Kiểm tra đề tài**
   - Xem đề tài đã được giảng viên duyệt
   - Kiểm tra tính phù hợp với chương trình học
   - Kiểm tra số lượng đề tài trong bộ môn

2. **Phê duyệt hoặc từ chối**
   - Cập nhật `head_status`:
     - "APPROVED": Được duyệt
     - "REJECTED": Bị từ chối
   - Nếu từ chối:
     - `head_rejection_reason`: Lý do từ chối
   - Nếu được duyệt:
     - `head_approval_date`: Ngày duyệt

3. **Override quy tắc (nếu cần)**
   - Có thể thay đổi quy tắc đề tài:
     - `head_override_group_mode`: Chế độ nhóm
     - `head_override_min_members`: Số thành viên tối thiểu
     - `head_override_max_members`: Số thành viên tối đa
     - `head_override_reason`: Lý do thay đổi

### 5. Tạo đồ án chính thức

1. **Khi cả giảng viên và trưởng bộ môn đều duyệt**
   - Tạo bản ghi trong bảng `theses`
   - Thiết lập:
     - thesis_code: Mã đồ án tự động
     - topic_title: Tên đề tài
     - thesis_group_id: Nhóm đồ án
     - thesis_round_id: Đợt đồ án
     - supervisor_id: Giảng viên hướng dẫn
     - topic_registration_id: ID đăng ký đề tài
     - topic_description: Mô tả
     - objectives: Mục tiêu
     - requirements: Yêu cầu
     - technologies_used: Công nghệ
     - status: "IN_PROGRESS"
     - defense_eligible: false

2. **Cập nhật đề tài đề xuất**
   - `is_taken`: true (đã được chọn)

3. **Tạo thành viên đồ án**
   - Tạo bản ghi trong bảng `thesis_members` cho từng thành viên
   - Liên kết với thesis_id và student_id

## Bảng database liên quan

- `proposed_topics`: Đề tài đề xuất
- `proposed_topic_rules`: Quy tắc đề tài
- `topic_registrations`: Đăng ký đề tài
- `theses`: Đồ án chính thức
- `thesis_members`: Thành viên đồ án
- `status_history`: Lịch sử trạng thái

## Endpoint API

- POST /api/instructors/proposed-topics
- POST /api/students/topic-registrations
- PUT /api/instructors/topic-registrations/:id/approve
- PUT /api/heads/topic-registrations/:id/approve
- GET /api/students/topic-registrations
- GET /api/instructors/topic-registrations/pending
