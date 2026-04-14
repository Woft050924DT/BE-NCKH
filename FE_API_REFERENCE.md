# API Reference cho Frontend - Topic Registrations

## Base URL
```
http://localhost:3000
```

**Lưu ý:** Không cần authentication token cho tất cả API.

---

## Topic Registrations API

### 1. Get Topic Registrations
Lấy danh sách đăng ký đề tài

- **Endpoint:** `GET /api/topic-registrations`
- **Query Parameters:**
  - `student_id` (optional): ID sinh viên để lọc đăng ký theo sinh viên
  - `status` (optional): Lọc theo trạng thái (PENDING, APPROVED, REJECTED)

**Example:**
```bash
# Lấy tất cả đăng ký
GET http://localhost:3000/api/topic-registrations

# Lấy đăng ký theo sinh viên
GET http://localhost:3000/api/topic-registrations?student_id=1

# Lấy đăng ký theo trạng thái
GET http://localhost:3000/api/topic-registrations?status=PENDING
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "instructor_status": "PENDING",
    "head_status": "PENDING",
    "registration_date": "2024-01-15T10:30:00.000Z",
    "proposed_topics": {
      "topic_title": "AI Application Development",
      "instructors": {
        "users": {
          "full_name": "Nguyen Van A",
          "email": "nguyenvana@example.com"
        }
      }
    },
    "thesis_groups": {
      "id": 1,
      "group_name": "Group 1"
    },
    "instructors": {
      "id": 1,
      "instructor_code": "GV001",
      "users": {
        "full_name": "Nguyen Van A"
      }
    }
  }
]
```

---

### 2. Create Topic Registration
Đăng ký đề tài (cho sinh viên)

- **Endpoint:** `POST /api/topic-registrations`
- **Request Body:**
```json
{
  "thesis_group_id": 1,
  "thesis_round_id": 1,
  "instructor_id": 1,
  "proposed_topic_id": 1,
  "self_proposed_title": "Custom Topic Title",
  "self_proposed_description": "Description of custom topic",
  "selection_reason": "Reason for selection",
  "applied_group_mode": "GROUP",
  "applied_min_members": 2,
  "applied_max_members": 4,
  "student_id": 1
}
```

**Lưu ý:**
- `proposed_topic_id`: Chọn đề tài từ danh sách đề xuất (optional)
- `self_proposed_title`: Tự đề xuất đề tài (nếu không chọn đề tài đề xuất)
- `student_id`: ID sinh viên đang đăng ký (bắt buộc)

**Response (201 Created):**
```json
{
  "id": 1,
  "thesis_group_id": 1,
  "thesis_round_id": 1,
  "instructor_id": 1,
  "instructor_status": "PENDING",
  "head_status": "PENDING",
  "registration_date": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Get Proposed Topics
Lấy danh sách đề tài đề xuất

- **Endpoint:** `GET /api/topic-registrations/proposed-topics`
- **Query Parameters:**
  - `thesis_round_id` (optional): Lọc theo đợt đồ án

**Example:**
```bash
GET http://localhost:3000/api/topic-registrations/proposed-topics?thesis_round_id=1
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "topic_code": "TOPIC001",
    "topic_title": "AI Application Development",
    "topic_description": "Develop AI applications for various use cases",
    "objectives": "Learn and apply AI techniques",
    "technologies_used": "Python, TensorFlow, React",
    "is_taken": false,
    "proposed_topic_rules": {
      "group_mode": "BOTH",
      "min_members": 1,
      "max_members": 4
    },
    "instructors": {
      "id": 1,
      "instructor_code": "GV001",
      "users": {
        "full_name": "Nguyen Van A",
        "email": "nguyenvana@example.com"
      }
    }
  }
]
```

---

### 4. Create Proposed Topic
Tạo đề tài đề xuất (cho giảng viên)

- **Endpoint:** `POST /api/topic-registrations/proposed-topics`
- **Request Body:**
```json
{
  "topic_code": "TOPIC002",
  "topic_title": "Web Application Development",
  "topic_description": "Develop modern web applications",
  "objectives": "Learn web development best practices",
  "student_requirements": "Basic HTML, CSS, JavaScript knowledge",
  "technologies_used": "React, Node.js, MongoDB",
  "topic_references": "References and resources",
  "thesis_round_id": 1,
  "group_mode": "BOTH",
  "min_members": 1,
  "max_members": 4,
  "reason": "Reason for proposing this topic",
  "instructor_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "topic_code": "TOPIC002",
  "topic_title": "Web Application Development",
  "instructor_id": 1,
  "thesis_round_id": 1,
  "is_taken": false,
  "status": true
}
```

---

### 5. Get Pending Registrations
Lấy danh sách đăng ký chờ duyệt (cho giảng viên)

- **Endpoint:** `GET /api/topic-registrations/pending`
- **Query Parameters:**
  - `instructor_id` (bắt buộc): ID giảng viên

**Example:**
```bash
GET http://localhost:3000/api/topic-registrations/pending?instructor_id=1
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "instructor_status": "PENDING",
    "thesis_groups": {
      "thesis_group_members": [
        {
          "students": {
            "student_code": "SV001",
            "users": {
              "full_name": "Tran Van B"
            },
            "classes": {
              "class_name": "CNTT-K15"
            }
          }
        }
      ]
    },
    "proposed_topics": {
      "topic_title": "AI Application Development"
    },
    "thesis_rounds": {
      "round_name": "Đợt 1 - 2024"
    }
  }
]
```

---

### 6. Approve Registration
Giảng viên duyệt/từ chối đăng ký

- **Endpoint:** `PUT /api/topic-registrations/:id/approve`
- **Request Body:**
```json
{
  "status": "APPROVED",
  "rejection_reason": "Reason for rejection",
  "instructor_id": 1
}
```

**Lưu ý:**
- `status`: "APPROVED" hoặc "REJECTED"
- `instructor_id`: ID giảng viên đang duyệt (bắt buộc)

**Response (200 OK):**
```json
{
  "id": 1,
  "instructor_status": "APPROVED",
  "instructor_rejection_reason": null,
  "instructor_approval_date": "2024-01-15T11:00:00.000Z"
}
```

---

### 7. Head Approve Registration
Trưởng bộ môn duyệt/từ chối đăng ký

- **Endpoint:** `PUT /api/topic-registrations/:id/head-approve`
- **Request Body:**
```json
{
  "status": "APPROVED",
  "rejection_reason": "Reason for rejection",
  "head_override_group_mode": "GROUP",
  "head_override_min_members": 2,
  "head_override_max_members": 4,
  "head_override_reason": "Reason for override"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "head_status": "APPROVED",
  "head_rejection_reason": null,
  "head_approval_date": "2024-01-15T12:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Thiếu student_id"
}
```

### 403 Forbidden
```json
{
  "error": "Không tìm thấy sinh viên"
}
```

### 500 Internal Server Error
```json
{
  "error": "Lỗi lấy danh sách đăng ký"
}
```

---

## Usage Examples

### Frontend - Fetch tất cả đăng ký
```javascript
fetch('http://localhost:3000/api/topic-registrations')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Frontend - Đăng ký đề tài
```javascript
fetch('http://localhost:3000/api/topic-registrations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    thesis_group_id: 1,
    thesis_round_id: 1,
    instructor_id: 1,
    proposed_topic_id: 1,
    selection_reason: 'Topic matches my interests',
    applied_group_mode: 'GROUP',
    applied_min_members: 2,
    applied_max_members: 4,
    student_id: 1
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Frontend - Lấy đề tài đề xuất
```javascript
fetch('http://localhost:3000/api/topic-registrations/proposed-topics?thesis_round_id=1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```
