# API Documentation - Quản lý Đồ Án

## Base URL
```
http://localhost:3000
```

## Authentication
Tất cả các request (trừ `/api/auth/login` và `/api/auth/logout`) cần gửi JWT token trong header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication API

### 1.1 Login
Đăng nhập vào hệ thống

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "fullName": "string",
    "role": "student|instructor",
    "studentId": "number",  // nếu là sinh viên
    "studentCode": "string",
    "className": "string",
    "instructorId": "number",  // nếu là giảng viên
    "instructorCode": "string",
    "departmentName": "string"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Email hoặc mật khẩu không đúng"
}
```

---

### 1.2 Logout
Đăng xuất khỏi hệ thống

**Endpoint:** `POST /api/auth/logout`

**Response (200 OK):**
```json
{
  "message": "Đăng xuất thành công"
}
```

---

### 1.3 Get Profile
Lấy thông tin profile của người dùng hiện tại

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "email": "string",
  "full_name": "string",
  "phone": "string",
  "avatar": "string",
  "created_at": "datetime",
  "studentCode": "string",  // nếu là sinh viên
  "className": "string",
  "majorName": "string",
  "gpa": "number",
  "creditsEarned": "number",
  "instructorCode": "string",  // nếu là giảng viên
  "departmentName": "string",
  "degree": "string",
  "academicTitle": "string",
  "role": "student|instructor"
}
```

---

## 2. Instructors API

### 2.1 Create Instructor
Tạo mới giảng viên

**Endpoint:** `POST /api/instructors`

**Request Body:**
```json
{
  "instructor_code": "string",
  "department_id": "number",
  "degree": "string",
  "academic_title": "string",
  "specialization": "string",
  "years_of_experience": "number",
  "username": "string",
  "password": "string",
  "email": "string",
  "full_name": "string",
  "phone": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "instructor_code": "string",
  "department_id": "number",
  "degree": "string",
  "academic_title": "string",
  "specialization": "string",
  "years_of_experience": "number",
  "status": "boolean",
  "users": {
    "id": "number",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "avatar": "string"
  },
  "departments_instructors_department_idTodepartments": {
    "id": "number",
    "department_code": "string",
    "department_name": "string"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Mã giảng viên đã tồn tại"
}
```

**Error Response (400):**
```json
{
  "error": "Username đã tồn tại"
}
```

---

### 2.2 Get Instructors
Lấy danh sách giảng viên

**Endpoint:** `GET /api/instructors`

**Query Parameters:**
- `thesis_round_id` (optional): Filter by thesis round ID
- `search` (optional): Search by instructor code or name
- `department_id` (optional): Filter by department ID

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "instructor_code": "string",
    "department_id": "number",
    "degree": "string",
    "academic_title": "string",
    "specialization": "string",
    "years_of_experience": "number",
    "status": "boolean",
    "users": {
      "id": "number",
      "full_name": "string",
      "email": "string",
      "phone": "string",
      "avatar": "string"
    },
    "departments_instructors_department_idTodepartments": {
      "id": "number",
      "department_code": "string",
      "department_name": "string"
    },
    "instructor_assignments": [
      {
        "supervision_quota": "number",
        "current_load": "number",
        "notes": "string"
      }
    ]
  }
]
```

---

### 2.3 Get Instructor by ID
Lấy thông tin chi tiết giảng viên theo ID

**Endpoint:** `GET /api/instructors/:id`

**Response (200 OK):**
```json
{
  "id": "number",
  "instructor_code": "string",
  "department_id": "number",
  "degree": "string",
  "academic_title": "string",
  "specialization": "string",
  "years_of_experience": "number",
  "status": "boolean",
  "users": {
    "id": "number",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "avatar": "string"
  },
  "departments_instructors_department_idTodepartments": {
    "id": "number",
    "department_code": "string",
    "department_name": "string"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Không tìm thấy giảng viên"
}
```

---

## 3. Thesis Rounds API (Admin only)

### 3.1 Create Thesis Round
Tạo đợt đồ án mới

**Endpoint:** `POST /api/admin/thesis-rounds`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "semester": "string",
  "round_name": "string",
  "start_date": "date",
  "end_date": "date",
  "registration_deadline": "date",
  "faculty_id": "number",
  "department_id": "number",
  "default_group_mode": "BOTH|GROUP|INDIVIDUAL",
  "default_min_members": "number",
  "default_max_members": "number"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "semester": "string",
  "round_name": "string",
  "start_date": "datetime",
  "end_date": "datetime",
  "registration_deadline": "datetime",
  "faculty_id": "number",
  "department_id": "number",
  "status": "DRAFT"
}
```

---

### 3.2 Activate Thesis Round
Kích hoạt đợt đồ án

**Endpoint:** `PUT /api/admin/thesis-rounds/:id/activate`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "status": "ACTIVE",
  ...
}
```

---

### 3.3 Assign Instructors
Phân công giảng viên cho đợt đồ án

**Endpoint:** `POST /api/admin/thesis-rounds/:id/assign-instructors`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "instructors": [
    {
      "instructor_id": "number",
      "quota": "number",
      "notes": "string"
    }
  ]
}
```

**Response (201 Created):**
```json
[
  {
    "id": "number",
    "thesis_round_id": "number",
    "instructor_id": "number",
    "supervision_quota": "number",
    "current_load": "number",
    "notes": "string"
  }
]
```

---

### 3.4 Assign Classes
Phân công lớp học cho đợt đồ án

**Endpoint:** `POST /api/admin/thesis-rounds/:id/assign-classes`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "class_ids": ["number"]
}
```

**Response (201 Created):**
```json
[
  {
    "id": "number",
    "thesis_round_id": "number",
    "class_id": "number"
  }
]
```

---

### 3.5 Add Guidance Process
Thêm quy trình hướng dẫn cho đợt đồ án

**Endpoint:** `POST /api/admin/thesis-rounds/:id/guidance-process`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "processes": [
    {
      "week_number": "number",
      "phase_name": "string",
      "work_description": "string",
      "expected_outcome": "string"
    }
  ]
}
```

**Response (201 Created):**
```json
[
  {
    "id": "number",
    "thesis_round_id": "number",
    "week_number": "number",
    "phase_name": "string",
    "work_description": "string",
    "expected_outcome": "string"
  }
]
```

---

### 3.6 Get Thesis Rounds
Lấy danh sách tất cả đợt đồ án

**Endpoint:** `GET /api/admin/thesis-rounds`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "semester": "string",
    "round_name": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "registration_deadline": "datetime",
    "status": "DRAFT|ACTIVE|COMPLETED",
    "thesis_round_rules": {...},
    "faculties": {...},
    "departments": {...}
  }
]
```

---

### 3.7 Get Thesis Round by ID
Lấy chi tiết đợt đồ án theo ID

**Endpoint:** `GET /api/admin/thesis-rounds/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "semester": "string",
  "round_name": "string",
  "status": "DRAFT|ACTIVE|COMPLETED",
  "thesis_round_rules": {...},
  "instructor_assignments": [
    {
      "instructors": {...}
    }
  ],
  "thesis_round_classes": [
    {
      "classes": {...}
    }
  ],
  "guidance_processes": [...]
}
```

---

## 4. Topic Registration API

### 4.1 Create Proposed Topic (Instructor only)
Giảng viên tạo đề tài đề xuất

**Endpoint:** `POST /api/topic-registrations/proposed-topics`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "topic_code": "string",
  "topic_title": "string",
  "topic_description": "string",
  "objectives": "string",
  "student_requirements": "string",
  "technologies_used": "string",
  "topic_references": "string",
  "thesis_round_id": "number",
  "group_mode": "BOTH|GROUP|INDIVIDUAL",
  "min_members": "number",
  "max_members": "number",
  "reason": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "topic_code": "string",
  "topic_title": "string",
  "instructor_id": "number",
  "thesis_round_id": "number",
  "is_taken": false,
  "status": true
}
```

---

### 4.2 Get Proposed Topics
Lấy danh sách đề tài đề xuất

**Endpoint:** `GET /api/topic-registrations/proposed-topics`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `thesis_round_id` (optional): Filter by thesis round

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "topic_code": "string",
    "topic_title": "string",
    "topic_description": "string",
    "objectives": "string",
    "technologies_used": "string",
    "is_taken": false,
    "proposed_topic_rules": {
      "group_mode": "BOTH|GROUP|INDIVIDUAL",
      "min_members": "number",
      "max_members": "number"
    },
    "instructors": {
      "id": "number",
      "instructor_code": "string",
      "users": {
        "full_name": "string",
        "email": "string"
      }
    }
  }
]
```

---

### 4.3 Create Topic Registration (Student only)
Sinh viên đăng ký đề tài

**Endpoint:** `POST /api/topic-registrations`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_group_id": "number",
  "thesis_round_id": "number",
  "instructor_id": "number",
  "proposed_topic_id": "number",  // optional - nếu chọn đề tài đề xuất
  "self_proposed_title": "string",  // optional - nếu tự đề xuất
  "self_proposed_description": "string",
  "selection_reason": "string",
  "applied_group_mode": "BOTH|GROUP|INDIVIDUAL",
  "applied_min_members": "number",
  "applied_max_members": "number"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_group_id": "number",
  "thesis_round_id": "number",
  "instructor_id": "number",
  "proposed_topic_id": "number",
  "self_proposed_title": "string",
  "instructor_status": "PENDING",
  "head_status": "PENDING",
  "registration_date": "datetime"
}
```

---

### 4.4 Get Topic Registrations
Lấy danh sách đăng ký đề tài của sinh viên hiện tại

**Endpoint:** `GET /api/topic-registrations`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "instructor_status": "PENDING|APPROVED|REJECTED",
    "head_status": "PENDING|APPROVED|REJECTED",
    "registration_date": "datetime",
    "proposed_topics": {
      "topic_title": "string",
      "instructors": {...}
    },
    "thesis_groups": {...},
    "thesis_rounds": {...}
  }
]
```

---

### 4.5 Get Pending Registrations (Instructor only)
Giảng viên lấy danh sách đăng ký chờ duyệt

**Endpoint:** `GET /api/topic-registrations/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "instructor_status": "PENDING",
    "thesis_groups": {
      "thesis_group_members": [
        {
          "students": {
            "student_code": "string",
            "users": {"full_name": "string"},
            "classes": {"class_name": "string"}
          }
        }
      ]
    },
    "proposed_topics": {...},
    "thesis_rounds": {...}
  }
]
```

---

### 4.6 Approve Registration (Instructor only)
Giảng viên duyệt/từ chối đăng ký

**Endpoint:** `PUT /api/topic-registrations/:id/approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "APPROVED|REJECTED",
  "rejection_reason": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "instructor_status": "APPROVED|REJECTED",
  "instructor_rejection_reason": "string",
  "instructor_approval_date": "datetime"
}
```

---

### 4.7 Head Approve Registration (Head only)
Trưởng bộ môn duyệt/từ chối đăng ký

**Endpoint:** `PUT /api/topic-registrations/:id/head-approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "APPROVED|REJECTED",
  "rejection_reason": "string",
  "head_override_group_mode": "BOTH|GROUP|INDIVIDUAL",
  "head_override_min_members": "number",
  "head_override_max_members": "number",
  "head_override_reason": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "head_status": "APPROVED|REJECTED",
  "head_rejection_reason": "string",
  "head_approval_date": "datetime"
}
```

---

## 5. Thesis Groups API

### 5.1 Create Thesis Group (Student only)
Sinh viên tạo nhóm đồ án

**Endpoint:** `POST /api/thesis-groups`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "group_name": "string",
  "thesis_round_id": "number",
  "group_type": "GROUP|INDIVIDUAL",
  "min_members": "number",
  "max_members": "number"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "group_name": "string",
  "thesis_round_id": "number",
  "group_type": "GROUP|INDIVIDUAL",
  "status": "FORMING",
  "min_members": "number",
  "max_members": "number"
}
```

---

### 5.2 Get Thesis Groups
Lấy danh sách nhóm đồ án

**Endpoint:** `GET /api/thesis-groups`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `thesis_round_id` (optional): Filter by thesis round

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "group_name": "string",
    "thesis_round_id": "number",
    "status": "FORMING|ACTIVE|COMPLETED",
    "thesis_group_members": [
      {
        "role": "LEADER|MEMBER",
        "students": {
          "student_code": "string",
          "users": {
            "full_name": "string",
            "email": "string"
          }
        }
      }
    ]
  }
]
```

---

### 5.3 Create Group Invitation (Student only)
Sinh viên gửi lời mời vào nhóm

**Endpoint:** `POST /api/thesis-groups/invitations`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_group_id": "number",
  "invited_student_id": "number",
  "invitation_message": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_group_id": "number",
  "invited_student_id": "number",
  "invited_by": "number",
  "invitation_message": "string",
  "status": "PENDING"
}
```

---

### 5.4 Accept Invitation (Student only)
Sinh viên chấp nhận lời mời

**Endpoint:** `PUT /api/thesis-groups/invitations/:id/accept`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "status": "ACCEPTED"
}
```

---

### 5.5 Reject Invitation (Student only)
Sinh viên từ chối lời mời

**Endpoint:** `PUT /api/thesis-groups/invitations/:id/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "status": "REJECTED"
}
```

---

### 5.6 Get Invitations
Lấy danh sách lời mời của sinh viên hiện tại

**Endpoint:** `GET /api/thesis-groups/invitations`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "thesis_group_id": "number",
    "invitation_message": "string",
    "status": "PENDING",
    "thesis_groups": {
      "group_name": "string"
    },
    "students_invited_by": {
      "student_code": "string",
      "users": {
        "full_name": "string"
      }
    }
  }
]
```

---

## 6. Grading API

### 6.1 Create Review Assignment (Admin only)
Tạo phân công đánh giá đồ án

**Endpoint:** `POST /api/review-assignments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_id": "number",
  "reviewer_id": "number",
  "review_order": "number",
  "review_deadline": "date"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_id": "number",
  "reviewer_id": "number",
  "review_order": "number",
  "assignment_date": "date",
  "review_deadline": "date",
  "status": "PENDING_REVIEW"
}
```

---

### 6.2 Submit Review Result (Instructor only)
Giảng viên nộp kết quả đánh giá

**Endpoint:** `POST /api/review-results`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "review_assignment_id": "number",
  "review_content": "string",
  "topic_evaluation": "string",
  "result_evaluation": "string",
  "improvement_suggestions": "string",
  "review_score": "number",
  "defense_approval": "boolean",
  "rejection_reason": "string",
  "review_file": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "review_assignment_id": "number",
  "review_content": "string",
  "review_score": "number",
  "defense_approval": "boolean",
  "review_date": "date"
}
```

---

### 6.3 Submit Supervision Comment (Instructor only)
Giảng viên nộp nhận xét hướng dẫn

**Endpoint:** `POST /api/supervision-comments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_id": "number",
  "instructor_id": "number",
  "comment_content": "string",
  "attitude_evaluation": "string",
  "capability_evaluation": "string",
  "result_evaluation": "string",
  "supervision_score": "number",
  "defense_approval": "boolean",
  "rejection_reason": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_id": "number",
  "instructor_id": "number",
  "comment_content": "string",
  "supervision_score": "number",
  "defense_approval": "boolean",
  "comment_date": "date"
}
```

---

### 6.4 Submit Peer Evaluation (Student only)
Sinh viên đánh giá đồng đội

**Endpoint:** `POST /api/peer-evaluations`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_id": "number",
  "evaluator_id": "number",
  "evaluated_id": "number",
  "evaluation_round": "number",
  "teamwork_score": "number",
  "responsibility_score": "number",
  "technical_skill_score": "number",
  "communication_score": "number",
  "contribution_score": "number",
  "average_score": "number",
  "strengths": "string",
  "weaknesses": "string",
  "suggestions": "string",
  "is_anonymous": "boolean"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_id": "number",
  "evaluator_id": "number",
  "evaluated_id": "number",
  "evaluation_round": "number",
  "average_score": "number",
  "evaluation_date": "datetime"
}
```

---

### 6.5 Review Weekly Report (Instructor only)
Giảng viên đánh giá báo cáo tuần

**Endpoint:** `PUT /api/weekly-reports/:id/review`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "instructor_feedback": "string",
  "review_score": "number",
  "review_status": "APPROVED|REJECTED|NEEDS_REVISION"
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "instructor_feedback": "string",
  "review_score": "number",
  "review_status": "APPROVED|REJECTED|NEEDS_REVISION",
  "reviewed_at": "datetime"
}
```

---

### 6.6 Get Thesis Scores
Lấy điểm số của đồ án

**Endpoint:** `GET /api/thesis-scores/:thesisId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "thesis_id": "number",
  "supervision_score": "number",
  "review_scores": [...],
  "peer_evaluation_scores": [...],
  "final_score": "number"
}
```

---

## 7. Report API

### 7.1 Create Thesis Task (Student only)
Sinh viên tạo công việc đồ án

**Endpoint:** `POST /api/thesis-tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_id": "number",
  "task_name": "string",
  "task_description": "string",
  "assigned_to": "number",
  "due_date": "date",
  "priority": "LOW|MEDIUM|HIGH",
  "status": "TODO|IN_PROGRESS|COMPLETED"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_id": "number",
  "task_name": "string",
  "task_description": "string",
  "assigned_to": "number",
  "due_date": "date",
  "priority": "LOW|MEDIUM|HIGH",
  "status": "TODO|IN_PROGRESS|COMPLETED"
}
```

---

### 7.2 Update Thesis Task
Cập nhật công việc đồ án

**Endpoint:** `PUT /api/thesis-tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "task_name": "string",
  "task_description": "string",
  "assigned_to": "number",
  "due_date": "date",
  "priority": "LOW|MEDIUM|HIGH",
  "status": "TODO|IN_PROGRESS|COMPLETED"
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "task_name": "string",
  "status": "TODO|IN_PROGRESS|COMPLETED",
  ...
}
```

---

### 7.3 Get Thesis Tasks
Lấy danh sách công việc đồ án

**Endpoint:** `GET /api/thesis-tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `thesis_id` (optional): Filter by thesis

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "thesis_id": "number",
    "task_name": "string",
    "task_description": "string",
    "assigned_to": "number",
    "due_date": "date",
    "priority": "LOW|MEDIUM|HIGH",
    "status": "TODO|IN_PROGRESS|COMPLETED"
  }
]
```

---

### 7.4 Create Weekly Report (Student only)
Sinh viên tạo báo cáo tuần

**Endpoint:** `POST /api/weekly-reports`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "thesis_id": "number",
  "week_number": "number",
  "report_content": "string",
  "achievements": "string",
  "challenges": "string",
  "next_week_plan": "string",
  "attachments": ["string"]
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "thesis_id": "number",
  "week_number": "number",
  "report_content": "string",
  "achievements": "string",
  "challenges": "string",
  "next_week_plan": "string",
  "submission_date": "datetime"
}
```

---

### 7.5 Update Weekly Report
Cập nhật báo cáo tuần

**Endpoint:** `PUT /api/weekly-reports/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "report_content": "string",
  "achievements": "string",
  "challenges": "string",
  "next_week_plan": "string",
  "attachments": ["string"]
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "report_content": "string",
  ...
}
```

---

### 7.6 Get Weekly Reports
Lấy danh sách báo cáo tuần

**Endpoint:** `GET /api/weekly-reports`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `thesis_id` (optional): Filter by thesis

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "thesis_id": "number",
    "week_number": "number",
    "report_content": "string",
    "achievements": "string",
    "challenges": "string",
    "next_week_plan": "string",
    "submission_date": "datetime",
    "instructor_feedback": "string",
    "review_score": "number",
    "review_status": "PENDING|APPROVED|REJECTED|NEEDS_REVISION"
  }
]
```

---

### 7.7 Add Individual Contribution (Student only)
Sinh viên thêm đóng góp cá nhân vào báo cáo tuần

**Endpoint:** `POST /api/weekly-report-contributions`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "weekly_report_id": "number",
  "student_id": "number",
  "contribution_description": "string",
  "hours_spent": "number",
  "tasks_completed": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "weekly_report_id": "number",
  "student_id": "number",
  "contribution_description": "string",
  "hours_spent": "number",
  "tasks_completed": "string"
}
```

---

### 7.8 Submit Final Report (Student only)
Sinh viên nộp báo cáo cuối cùng

**Endpoint:** `PUT /api/theses/:id/submit-final-report`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "final_report_file": "string",
  "source_code_link": "string",
  "demo_link": "string",
  "submission_notes": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "final_report_file": "string",
  "source_code_link": "string",
  "demo_link": "string",
  "final_submission_date": "datetime"
}
```

---

### 7.9 Get Thesis Progress
Lấy tiến độ đồ án

**Endpoint:** `GET /api/thesis-progress/:thesisId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "thesis_id": "number",
  "overall_progress": "number",
  "tasks_completed": "number",
  "tasks_total": "number",
  "weekly_reports_submitted": "number",
  "total_weeks": "number",
  "recent_activities": [...]
}
```

---

## 8. Defense API

### 8.1 Create Defense Council (Admin only)
Tạo hội đồng bảo vệ

**Endpoint:** `POST /api/defense-councils`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "council_code": "string",
  "council_name": "string",
  "thesis_round_id": "number",
  "chairman_id": "number",
  "secretary_id": "number",
  "defense_date": "date",
  "start_time": "time",
  "end_time": "time",
  "venue": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "council_code": "string",
  "council_name": "string",
  "thesis_round_id": "number",
  "chairman_id": "number",
  "secretary_id": "number",
  "defense_date": "date",
  "start_time": "time",
  "end_time": "time",
  "venue": "string",
  "status": "PREPARING"
}
```

---

### 8.2 Add Council Member (Admin only)
Thêm thành viên vào hội đồng

**Endpoint:** `POST /api/defense-councils/:id/members`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "instructor_id": "number",
  "role": "CHAIRMAN|SECRETARY|MEMBER|REVIEWER",
  "order_number": "number"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "defense_council_id": "number",
  "instructor_id": "number",
  "role": "CHAIRMAN|SECRETARY|MEMBER|REVIEWER",
  "order_number": "number"
}
```

---

### 8.3 Create Defense Assignment (Admin only)
Tạo phân công bảo vệ

**Endpoint:** `POST /api/defense-assignments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "defense_council_id": "number",
  "thesis_id": "number",
  "defense_order": "number",
  "defense_time": "time"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "defense_council_id": "number",
  "thesis_id": "number",
  "defense_order": "number",
  "defense_time": "time",
  "status": "PENDING_DEFENSE"
}
```

---

### 8.4 Submit Defense Result (Instructor only)
Giảng viên nộp kết quả bảo vệ

**Endpoint:** `POST /api/defense-results`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "defense_assignment_id": "number",
  "instructor_id": "number",
  "defense_score": "number",
  "comments": "string",
  "suggestions": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "defense_assignment_id": "number",
  "instructor_id": "number",
  "defense_score": "number",
  "comments": "string",
  "suggestions": "string",
  "created_at": "datetime"
}
```

---

### 8.5 Complete Defense Council (Admin only)
Hoàn thành hội đồng bảo vệ

**Endpoint:** `PUT /api/defense-councils/:id/complete`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "status": "COMPLETED",
  ...
}
```

---

### 8.6 Get Defense Schedule
Lấy lịch bảo vệ của đồ án

**Endpoint:** `GET /api/defense-schedule/:thesisId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "thesis_id": "number",
  "defense_council": {
    "council_name": "string",
    "defense_date": "date",
    "start_time": "time",
    "end_time": "time",
    "venue": "string"
  },
  "defense_assignment": {
    "defense_order": "number",
    "defense_time": "time",
    "status": "PENDING_DEFENSE|DEFENSE_COMPLETED"
  },
  "council_members": [...]
}
```

---

### 8.7 Get Defense Results
Lấy kết quả bảo vệ của đồ án

**Endpoint:** `GET /api/defense-results/:thesisId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "thesis_id": "number",
  "defense_results": [
    {
      "instructor_id": "number",
      "defense_score": "number",
      "comments": "string",
      "suggestions": "string"
    }
  ],
  "average_defense_score": "number"
}
```

---

### 8.8 Finalize Thesis (Admin only)
Hoàn thành đồ án

**Endpoint:** `PUT /api/theses/:id/finalize`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "number",
  "status": "COMPLETED",
  "final_score": "number",
  "completion_date": "datetime"
}
```

---

## Error Responses

### Common Error Codes
- `400 Bad Request`: Request body không hợp lệ
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Resource không tồn tại
- `500 Internal Server Error`: Lỗi server

### Error Response Format
```json
{
  "error": "Error message"
}
```

---

## Notes

1. **Authentication**: Tất cả API (trừ login/logout) cần JWT token trong header `Authorization: Bearer <token>`
2. **Role-based Access**: Một số API chỉ dành cho vai trò cụ thể (admin, instructor, student)
3. **Date Format**: Sử dụng ISO 8601 format (YYYY-MM-DD)
4. **Time Format**: Sử dụng HH:mm:ss format
5. **Pagination**: Một số API có thể hỗ trợ pagination trong tương lai
6. **File Upload**: Các field file có thể là URL hoặc path đến file đã upload

---

## Postman Collection

Bạn có thể import các API này vào Postman để test. Đảm bảo:
1. Đặt base URL là `http://localhost:3000`
2. Thêm token vào header cho các request cần authentication
3. Sử dụng đúng HTTP method (GET, POST, PUT, DELETE)
