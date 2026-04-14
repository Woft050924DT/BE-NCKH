# Instructors API Documentation

## Base URL
```
http://localhost:3000
```

---

## 1. Create Instructor
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

**Example Request:**
```bash
POST /api/instructors
Content-Type: application/json

{
  "instructor_code": "GV001",
  "department_id": 1,
  "degree": "Tiến sĩ",
  "academic_title": "Giảng viên chính",
  "specialization": "Công nghệ thông tin",
  "years_of_experience": 5,
  "username": "gv001",
  "password": "password123",
  "email": "gv001@university.edu.vn",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789"
}
```

---

## 2. Get Instructors
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

**Example Request:**
```bash
# Get all instructors
GET /api/instructors

# Filter by thesis round
GET /api/instructors?thesis_round_id=1

# Search by name
GET /api/instructors?search=Nguyen

# Filter by department
GET /api/instructors?department_id=5

# Combine filters
GET /api/instructors?thesis_round_id=1&search=Nguyen&department_id=5
```

---

## 3. Get Instructor by ID
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

**Example Request:**
```bash
GET /api/instructors/1
```

---

## Error Responses

**Error Response (500):**
```json
{
  "error": "Lỗi lấy danh sách giảng viên"
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## Use Cases

### 1. Topic Registration - Select Instructor
Khi sinh viên đăng ký đề tài, frontend cần hiển thị danh sách giảng viên để chọn.

**Request:**
```bash
GET /api/instructors?thesis_round_id=1
```

**Response:** Danh sách giảng viên đã được phân công cho đợt đồ án hiện tại, bao gồm thông tin quota và current_load.

### 2. Search Instructor
Khi người dùng nhập từ khóa vào ô tìm kiếm giảng viên.

**Request:**
```bash
GET /api/instructors?search=Nguyen
```

**Response:** Danh sách giảng viên có mã hoặc tên chứa từ khóa "Nguyen".

### 3. Filter by Department
Khi cần lọc giảng viên theo bộ môn.

**Request:**
```bash
GET /api/instructors?department_id=5
```

**Response:** Danh sách giảng viên thuộc bộ môn có ID = 5.
