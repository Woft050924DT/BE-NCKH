---
description: Quy trình chấm điểm đồ án - tiểu luận
---

# Workflow Chấm Điểm Đồ Án - Tiểu Luận

Quy trình giảng viên chấm điểm đồ án/tiểu luận sinh viên.

## Các bước thực hiện

### 1. Phân công chấm bài

1. **Tạo phân công chấm bài**
   - Tạo bản ghi trong bảng `review_assignments`
   - Thiết lập:
     - thesis_id: ID đồ án
     - reviewer_id: ID giảng viên chấm
     - review_order: Thứ tự chấm (1, 2, 3...)
     - assignment_date: Ngày phân công
     - review_deadline: Hạn chấm bài
     - status: "PENDING_REVIEW"

2. **Gửi thông báo**
   - Thông báo cho giảng viên được phân công
   - Gửi deadline

### 2. Giảng viên chấm bài

1. **Xem thông tin đồ án**
   - Truy vấn bảng `theses`
   - Xem đề tài, mô tả, mục tiêu
   - Xem file báo cáo (final_report_file)
   - Xem outline_file

2. **Đánh giá và chấm điểm**
   - Tạo bản ghi trong bảng `review_results`
   - Thiết lập:
     - review_assignment_id: ID phân công
     - review_content: Nội dung đánh giá
     - topic_evaluation: Đánh giá đề tài
     - result_evaluation: Đánh giá kết quả
     - improvement_suggestions: Gợi ý cải thiện
     - review_score: Điểm số (0-10)
     - defense_approval: true/false (được bảo vệ)
     - rejection_reason: Lý do từ chối (nếu có)
     - review_date: Ngày chấm
     - review_file: File đánh giá (nếu có)

3. **Cập nhật trạng thái phân công**
   - Cập nhật status trong `review_assignments`:
     - "COMPLETED": Đã chấm xong
     - "REJECTED": Từ chối chấm

### 3. Tổng hợp điểm số

1. **Tính điểm trung bình**
   - Lấy tất cả review_results cho thesis_id
   - Tính trung bình review_score
   - Cập nhật review_score trong bảng `theses`

2. **Kiểm tra điều kiện bảo vệ**
   - Nếu tất cả defense_approval = true
   - Cập nhật defense_eligible = true trong `theses`

### 4. Chấm điểm hướng dẫn

1. **Giảng viên hướng dẫn đánh giá**
   - Tạo bản ghi trong bảng `supervision_comments`
   - Thiết lập:
     - thesis_id: ID đồ án
     - instructor_id: ID giảng viên hướng dẫn
     - comment_content: Nhận xét
     - attitude_evaluation: Đánh giá thái độ
     - capability_evaluation: Đánh giá năng lực
     - result_evaluation: Đánh giá kết quả
     - supervision_score: Điểm hướng dẫn (0-10)
     - defense_approval: true/false
     - rejection_reason: Lý do từ chối
     - comment_date: Ngày đánh giá

2. **Cập nhật điểm hướng dẫn**
   - Cập nhật supervision_score trong bảng `theses`

### 5. Chấm điểm đánh giá đồng đẳng (Peer Evaluation)

1. **Sinh viên đánh giá lẫn nhau**
   - Tạo bản ghi trong bảng `peer_evaluations`
   - Thiết lập:
     - thesis_id: ID đồ án
     - evaluator_id: ID sinh viên đánh giá
     - evaluated_id: ID sinh viên được đánh giá
     - evaluation_round: Vòng đánh giá (1, 2, 3...)
     - teamwork_score: Điểm làm việc nhóm
     - responsibility_score: Điểm trách nhiệm
     - technical_skill_score: Điểm kỹ thuật
     - communication_score: Điểm giao tiếp
     - contribution_score: Điểm đóng góp
     - average_score: Điểm trung bình
     - strengths: Điểm mạnh
     - weaknesses: Điểm yếu
     - suggestions: Gợi ý
     - is_anonymous: ẩn danh
     - evaluation_date: Ngày đánh giá

2. **Tính điểm trung bình peer evaluation**
   - Lấy tất cả peer_evaluations cho evaluated_id
   - Tính trung bình các điểm số
   - Có thể dùng để điều chỉnh điểm cuối cùng

### 6. Chấm điểm báo cáo tuần

1. **Sinh viên nộp báo cáo tuần**
   - Tạo bản ghi trong bảng `weekly_reports`
   - Thiết lập:
     - thesis_id: ID đồ án
     - week_number: Tuần thứ
     - report_content: Nội dung báo cáo
     - progress_percentage: % tiến độ
     - challenges: Khó khăn
     - next_plan: Kế hoạch tiếp theo
     - student_status: "SUBMITTED"
     - submission_date: Ngày nộp

2. **Giảng viên đánh giá báo cáo**
   - Cập nhật trong `weekly_reports`:
     - instructor_comments: Nhận xét giảng viên
     - instructor_score: Điểm báo cáo
     - instructor_status: "APPROVED" hoặc "REJECTED"
     - review_date: Ngày đánh giá

3. **Đóng góp cá nhân (nếu làm việc nhóm)**
   - Tạo bản ghi trong bảng `weekly_report_individual_contributions`
   - Thiết lập:
     - weekly_report_id: ID báo cáo tuần
     - student_id: ID sinh viên
     - contribution_description: Mô tả đóng góp
     - hours_spent: Số giờ làm việc
     - tasks_completed: Công việc hoàn thành

## Bảng database liên quan

- `review_assignments`: Phân công chấm bài
- `review_results`: Kết quả chấm bài
- `supervision_comments`: Nhận xét hướng dẫn
- `peer_evaluations`: Đánh giá đồng đẳng
- `weekly_reports`: Báo cáo tuần
- `weekly_report_individual_contributions`: Đóng góp cá nhân
- `theses`: Đồ án

## Endpoint API

- POST /api/admin/review-assignments
- PUT /api/instructors/review-assignments/:id/complete
- POST /api/instructors/review-results
- POST /api/instructors/supervision-comments
- POST /api/students/peer-evaluations
- POST /api/students/weekly-reports
- PUT /api/instructors/weekly-reports/:id/review
- GET /api/students/thesis-scores/:thesisId
