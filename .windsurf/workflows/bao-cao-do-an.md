---
description: Quy trình báo cáo đồ án
---

# Workflow Báo Cáo Đồ Án

Quy trình sinh viên nộp báo cáo tiến độ đồ án.

## Các bước thực hiện

### 1. Tạo nhiệm vụ đồ án

1. **Giảng viên hoặc sinh viên tạo nhiệm vụ**
   - Tạo bản ghi trong bảng `thesis_tasks`
   - Thiết lập:
     - thesis_id: ID đồ án
     - task_title: Tên nhiệm vụ
     - task_description: Mô tả chi tiết
     - assigned_to: ID sinh viên được giao (nếu có)
     - created_by: ID người tạo
     - due_date: Hạn hoàn thành
     - priority: "HIGH", "MEDIUM", "LOW"
     - status: "TODO"
     - progress_percentage: 0
     - start_date: Ngày bắt đầu
     - end_date: Ngày kết thúc

2. **Giao nhiệm vụ cho thành viên**
   - Nếu làm việc nhóm, phân công cho từng thành viên
   - Gửi thông báo cho sinh viên được giao

### 2. Cập nhật tiến độ nhiệm vụ

1. **Sinh viên cập nhật tiến độ**
   - Cập nhật trong `thesis_tasks`:
     - status: "IN_PROGRESS", "COMPLETED", "BLOCKED"
     - progress_percentage: % hoàn thành
     - notes: Ghi chú

2. **Hoàn thành nhiệm vụ**
   - Cập nhật status = "COMPLETED"
   - Cập nhật progress_percentage = 100
   - Cập nhật end_date = ngày hoàn thành

### 3. Nộp báo cáo tuần

1. **Sinh viên tạo báo cáo tuần**
   - Tạo bản ghi trong bảng `weekly_reports`
   - Thiết lập:
     - thesis_id: ID đồ án
     - week_number: Tuần thứ (theo guidance_processes)
     - report_content: Nội dung báo cáo
     - progress_percentage: % tiến độ tổng thể
     - challenges: Khó khăn gặp phải
     - next_plan: Kế hoạch tuần sau
     - student_status: "SUBMITTED"
     - submission_date: Ngày nộp

2. **Đóng góp cá nhân (nếu làm việc nhóm)**
   - Tạo bản ghi trong bảng `weekly_report_individual_contributions`
   - Thiết lập:
     - weekly_report_id: ID báo cáo tuần
     - student_id: ID sinh viên
     - contribution_description: Mô tả đóng góp
     - hours_spent: Số giờ làm việc trong tuần
     - tasks_completed: Danh sách công việc hoàn thành

3. **Gửi thông báo**
   - Thông báo giảng viên hướng dẫn
   - Thông báo các thành viên nhóm

### 4. Giảng viên đánh giá báo cáo tuần

1. **Xem báo cáo**
   - Truy vấn bảng `weekly_reports`
   - Xem nội dung, tiến độ, khó khăn
   - Xem đóng góp từng thành viên

2. **Đánh giá và nhận xét**
   - Cập nhật trong `weekly_reports`:
     - instructor_comments: Nhận xét giảng viên
     - instructor_score: Điểm báo cáo (0-10)
     - instructor_status: "APPROVED" hoặc "REJECTED"
     - review_date: Ngày đánh giá
     - rejection_reason: Lý do từ chối (nếu có)

3. **Gửi phản hồi**
   - Thông báo sinh viên về kết quả đánh giá
   - Nếu bị từ chối, yêu cầu nộp lại

### 5. Nộp báo cáo cuối kỳ

1. **Sinh viên nộp báo cáo cuối kỳ**
   - Cập nhật trong bảng `theses`:
     - final_report_file: Link file báo cáo
     - outline_file: Link file outline
     - start_date: Ngày bắt đầu thực tế
     - end_date: Ngày kết thúc thực tế

2. **Kiểm tra điều kiện nộp báo cáo**
   - Đã nộp đủ số báo cáo tuần theo quy định
   - Tiến độ đạt yêu cầu
   - Không có báo cáo nào bị từ chối

### 6. Theo dõi tiến độ chung

1. **Xem tổng quan tiến độ**
   - Lấy tất cả thesis_tasks cho thesis_id
   - Tính % hoàn thành trung bình
   - Kiểm tra các task quá hạn

2. **Xem báo cáo tuần**
   - Lấy tất cả weekly_reports cho thesis_id
   - Kiểm tra số báo cáo đã nộp
   - Xem điểm số báo cáo

3. **Nhắc nhở deadline**
   - Tự động thông báo trước deadline
   - Thông báo khi task quá hạn

## Bảng database liên quan

- `thesis_tasks`: Nhiệm vụ đồ án
- `weekly_reports`: Báo cáo tuần
- `weekly_report_individual_contributions`: Đóng góp cá nhân
- `guidance_processes`: Quy trình hướng dẫn
- `theses`: Đồ án

## Endpoint API

- POST /api/students/thesis-tasks
- PUT /api/students/thesis-tasks/:id
- GET /api/students/thesis-tasks
- POST /api/students/weekly-reports
- PUT /api/students/weekly-reports/:id
- PUT /api/instructors/weekly-reports/:id/review
- GET /api/students/weekly-reports
- PUT /api/students/theses/:id/submit-final-report
- GET /api/students/thesis-progress/:thesisId
