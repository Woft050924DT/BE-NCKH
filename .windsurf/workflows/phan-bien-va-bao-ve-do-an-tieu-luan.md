---
description: Quy trình phản biện và bảo vệ đồ án - tiểu luận
---

# Workflow Phản Biện và Bảo Vệ Đồ Án - Tiểu Luận

Quy trình tổ chức hội đồng bảo vệ, phản biện và chấm điểm bảo vệ đồ án/tiểu luận.

## Các bước thực hiện

### 1. Kiểm tra điều kiện bảo vệ

1. **Kiểm tra điểm số**
   - review_score: Điểm chấm bài ≥ 5.0
   - supervision_score: Điểm hướng dẫn ≥ 5.0
   - defense_eligible: true

2. **Kiểm tra báo cáo**
   - Đã nộp final_report_file
   - Đã nộp outline_file
   - Đã hoàn thành đủ báo cáo tuần

3. **Cập nhật trạng thái**
   - Nếu đủ điều kiện, cập nhật status trong `theses` = "READY_FOR_DEFENSE"

### 2. Tạo hội đồng bảo vệ

1. **Tạo hội đồng**
   - Tạo bản ghi trong bảng `defense_councils`
   - Thiết lập:
     - council_code: Mã hội đồng
     - council_name: Tên hội đồng
     - thesis_round_id: Đợt đồ án
     - chairman_id: ID chủ tịch
     - secretary_id: ID thư ký
     - defense_date: Ngày bảo vệ
     - start_time: Giờ bắt đầu
     - end_time: Giờ kết thúc
     - venue: Địa điểm
     - status: "PREPARING"
     - notes: Ghi chú

2. **Thêm thành viên hội đồng**
   - Tạo bản ghi trong bảng `council_members`
   - Thiết lập:
     - defense_council_id: ID hội đồng
     - instructor_id: ID giảng viên
     - role: "CHAIRMAN", "SECRETARY", "REVIEWER", "MEMBER"
     - order_number: Thứ tự phát biểu
     - created_at: Ngày thêm

3. **Phân công đồ án cho hội đồng**
   - Tạo bản ghi trong bảng `defense_assignments`
   - Thiết lập:
     - defense_council_id: ID hội đồng
     - thesis_id: ID đồ án
     - defense_order: Thứ tự bảo vệ
     - defense_time: Thời gian dự kiến
     - status: "PENDING_DEFENSE"

### 3. Lên lịch bảo vệ

1. **Xác định thời gian**
   - Phân bố thời gian cho từng đồ án
   - Mỗi đồ án: 30-45 phút
   - Bao gồm: trình bày, phản biện, trả lời câu hỏi

2. **Cập nhật thông tin**
   - Cập nhật defense_date, start_time, end_time
   - Cập nhật defense_order cho từng đồ án
   - Cập nhật defense_time cho từng đồ án

3. **Gửi thông báo**
   - Thông báo cho sinh viên
   - Thông báo cho thành viên hội đồng
   - Gửi lịch bảo vệ chi tiết

### 4. Diễn ra buổi bảo vệ

1. **Sinh viên trình bày**
   - Thời gian: 10-15 phút
   - Trình bày: đề tài, phương pháp, kết quả
   - Thuyết trình bằng slide

2. **Hội đồng phản biện**
   - Thành viên hội đồng đặt câu hỏi
   - Sinh viên trả lời
   - Thời gian: 10-15 phút

3. **Hội đồng thảo luận**
   - Thành viên hội đồng thảo luận kín
   - Đánh giá điểm số
   - Ra quyết định

4. **Cập nhật trạng thái**
   - Cập nhật status trong `defense_assignments` = "COMPLETED"
   - Cập nhật status trong `defense_councils` = "COMPLETED"

### 5. Hội đồng chấm điểm bảo vệ

1. **Thành viên hội đồng chấm điểm**
   - Tạo bản ghi trong bảng `defense_results`
   - Thiết lập:
     - defense_assignment_id: ID phân công bảo vệ
     - instructor_id: ID giảng viên chấm
     - defense_score: Điểm bảo vệ (0-10)
     - comments: Nhận xét
     - suggestions: Gợi ý cải thiện
     - created_at: Ngày chấm

2. **Tính điểm trung bình bảo vệ**
   - Lấy tất cả defense_results cho defense_assignment_id
   - Tính trung bình defense_score
   - Cập nhật defense_score trong bảng `theses`

### 6. Tổng hợp điểm cuối cùng

1. **Tính điểm tổng kết**
   - Formula: (review_score × 30%) + (supervision_score × 30%) + (defense_score × 40%)
   - Hoặc theo quy định của khoa

2. **Xác định kết quả**
   - Điểm ≥ 5: Đạt
   - Điểm < 5: Không đạt
   - Cập nhật status trong `theses`:
     - "COMPLETED": Đạt
     - "FAILED": Không đạt
     - "DEFERRED": Hoãn bảo vệ

3. **Lưu lịch sử trạng thái**
   - Tạo bản ghi trong bảng `status_history`
   - Thiết lập:
     - table_name: "theses"
     - record_id: thesis_id
     - old_status: Trạng thái cũ
     - new_status: Trạng thái mới
     - changed_by_id: ID người thay đổi
     - change_reason: Lý do thay đổi
     - change_date: Ngày thay đổi

### 7. Công bố kết quả

1. **Cập nhật thông tin**
   - Cập nhật status trong `theses`
   - Cập nhật điểm số cuối cùng
   - Lưu vào status_history

2. **Gửi thông báo**
   - Thông báo sinh viên về kết quả
   - Thông báo giảng viên hướng dẫn
   - Công bố trên hệ thống

3. **Xuất biên bản bảo vệ**
   - Tạo file biên bản
   - Chứa: điểm số, nhận xét, kết quả
   - Ký bởi chủ tịch và thư ký

### 8. Xử lý trường hợp không đạt

1. **Nếu không đạt**
   - Sinh viên có thể đăng ký bảo vệ lại
   - Phải cải thiện đồ án theo nhận xét
   - Đăng ký trong đợt đồ án tiếp theo

2. **Nếu hoãn bảo vệ**
   - Xác định lý do hoãn
   - Đặt lịch bảo vệ lại
   - Cập nhật status = "DEFERRED"

## Bảng database liên quan

- `defense_councils`: Hội đồng bảo vệ
- `council_members`: Thành viên hội đồng
- `defense_assignments`: Phân công bảo vệ
- `defense_results`: Kết quả bảo vệ
- `theses`: Đồ án
- `status_history`: Lịch sử trạng thái

## Endpoint API

- POST /api/admin/defense-councils
- PUT /api/admin/defense-councils/:id
- POST /api/admin/defense-councils/:id/members
- POST /api/admin/defense-assignments
- PUT /api/admin/defense-assignments/:id
- POST /api/instructors/defense-results
- PUT /api/admin/defense-councils/:id/complete
- GET /api/students/defense-schedule/:thesisId
- GET /api/students/defense-results/:thesisId
- PUT /api/admin/theses/:id/finalize
