---
description: Quy trình đăng ký đồ án
---

# Workflow Đăng Ký Đồ Án

Quy trình sinh viên đăng ký đề tài đồ án và tạo nhóm.

## Các bước thực hiện

### 1. Xem danh sách đề tài có sẵn

1. **Lấy danh sách đề tài**
   - Truy vấn bảng `proposed_topics`
   - Lọc theo:
     - thesis_round_id: Đợt đồ án hiện tại
     - status: true (hoạt động)
     - is_taken: false (chưa được chọn)
   - Sắp xếp theo created_at

2. **Xem chi tiết đề tài**
   - Lấy thông tin từ bảng `proposed_topic_rules`
   - Xem quy tắc:
     - group_mode: Chế độ làm việc
     - min_members: Số thành viên tối thiểu
     - max_members: Số thành viên tối đa

### 2. Tạo nhóm đồ án (nếu làm việc nhóm)

1. **Tạo nhóm mới**
   - Tạo bản ghi trong bảng `thesis_groups`
   - Thiết lập:
     - group_name: Tên nhóm
     - thesis_round_id: Đợt đồ án
     - group_type: "GROUP"
     - status: "FORMING"
     - min_members: Theo quy tắc đợt
     - max_members: Theo quy tắc đợt

2. **Mời thành viên**
   - Tạo bản ghi trong bảng `thesis_group_invitations`
   - Thiết lập:
     - thesis_group_id: ID nhóm
     - invited_student_id: Sinh viên được mời
     - invited_by: Sinh viên mời
     - invitation_message: Thông điệp
     - status: "PENDING"

3. **Chấp nhận/Từ chối lời mời**
   - Cập nhật status trong `thesis_group_invitations`:
     - "ACCEPTED": Chấp nhận
     - "REJECTED": Từ chối

4. **Thêm thành viên vào nhóm**
   - Khi chấp nhận, tạo bản ghi trong `thesis_group_members`
   - Thiết lập:
     - thesis_group_id: ID nhóm
     - student_id: ID sinh viên
     - role: "MEMBER" hoặc "LEADER"
     - join_method: "INVITE"
     - joined_at: Ngày tham gia

### 3. Chọn đề tài

1. **Chọn đề tài từ danh sách**
   - Ghi lại proposed_topic_id
   - Điền selection_reason

2. **Hoặc tự đề xuất đề tài**
   - Điền self_proposed_title
   - Điền self_proposed_description

### 4. Đăng ký đề tài

1. **Tạo bản ghi đăng ký**
   - Tạo bản ghi trong bảng `topic_registrations`
   - Thiết lập:
     - thesis_group_id: ID nhóm (nếu làm việc nhóm)
     - thesis_round_id: Đợt đồ án
     - instructor_id: Giảng viên hướng dẫn
     - proposed_topic_id: Đề tài được chọn (nếu có)
     - self_proposed_title: Tên đề tài tự đề xuất
     - self_proposed_description: Mô tả đề tài tự đề xuất
     - selection_reason: Lý do chọn
     - applied_group_mode: Chế độ nhóm
     - applied_min_members: Số thành viên tối thiểu
     - applied_max_members: Số thành viên tối đa
     - registration_date: Ngày đăng ký
     - instructor_status: "PENDING"
     - head_status: "PENDING"

2. **Kiểm tra điều kiện đăng ký**
   - Kiểm tra từ bảng `student_thesis_rounds`:
     - eligible: true
   - Kiểm tra số lượng thành viên nhóm
   - Kiểm tra hạn đăng ký (registration_deadline)

3. **Gửi thông báo**
   - Thông báo cho giảng viên hướng dẫn
   - Thông báo cho trưởng bộ môn

### 5. Theo dõi trạng thái đăng ký

1. **Kiểm tra trạng thái**
   - instructor_status: "PENDING", "APPROVED", "REJECTED"
   - head_status: "PENDING", "APPROVED", "REJECTED"

2. **Xem lý do từ chối (nếu có)**
   - instructor_rejection_reason
   - head_rejection_reason

3. **Đăng ký lại nếu bị từ chối**
   - Tạo bản ghi đăng ký mới
   - Đăng ký đề tài khác

## Bảng database liên quan

- `proposed_topics`: Đề tài đề xuất
- `proposed_topic_rules`: Quy tắc đề tài
- `thesis_groups`: Nhóm đồ án
- `thesis_group_invitations`: Lời mời tham gia nhóm
- `thesis_group_members`: Thành viên nhóm
- `topic_registrations`: Đăng ký đề tài
- `student_thesis_rounds`: Sinh viên đủ điều kiện

## Endpoint API

- GET /api/students/proposed-topics
- POST /api/students/thesis-groups
- POST /api/students/thesis-group-invitations
- PUT /api/students/thesis-group-invitations/:id/accept
- PUT /api/students/thesis-group-invitations/:id/reject
- POST /api/students/topic-registrations
- GET /api/students/topic-registrations
- GET /api/students/thesis-groups
