# API Reference cho Frontend - Giáo Viên Hướng Dẫn

## Base URL
```
http://localhost:3000
```

**Lưu ý:** Không cần authentication token cho tất cả API.

---

## Instructors API

### 1. Get Instructors
Lấy danh sách giáo viên hướng dẫn

- **Endpoint:** `GET /api/instructors`
- **Query Parameters:**
  - `thesis_round_id` (optional): Lọc theo đợt đồ án
  - `search` (optional): Tìm kiếm theo mã giảng viên hoặc tên
  - `department_id` (optional): Lọc theo khoa/bộ môn

**Example:**
```bash
# Lấy tất cả giảng viên
GET http://localhost:3000/api/instructors

# Lấy giảng viên theo đợt đồ án
GET http://localhost:3000/api/instructors?thesis_round_id=1

# Tìm kiếm giảng viên
GET http://localhost:3000/api/instructors?search=Nguyen

# Lọc theo khoa
GET http://localhost:3000/api/instructors?department_id=1

# Kết hợp các bộ lọc
GET http://localhost:3000/api/instructors?thesis_round_id=1&department_id=1
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "instructor_code": "GV001",
    "department_id": 1,
    "degree": "Tiến sĩ",
    "academic_title": "Giảng viên chính",
    "specialization": "Trí tuệ nhân tạo",
    "years_of_experience": 5,
    "status": true,
    "users": {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "avatar": "https://example.com/avatar.jpg"
    },
    "departments_instructors_department_idTodepartments": {
      "id": 1,
      "department_code": "CNTT",
      "department_name": "Khoa Công nghệ thông tin"
    },
    "instructor_assignments": [
      {
        "supervision_quota": 5,
        "current_load": 3,
        "notes": "Chuyên gia AI"
      }
    ]
  },
  {
    "id": 2,
    "instructor_code": "GV002",
    "department_id": 1,
    "degree": "Thạc sĩ",
    "academic_title": "Giảng viên",
    "specialization": "Phát triển Web",
    "years_of_experience": 3,
    "status": true,
    "users": {
      "id": 2,
      "full_name": "Trần Thị B",
      "email": "tranthib@example.com",
      "phone": "0909876543",
      "avatar": "https://example.com/avatar2.jpg"
    },
    "departments_instructors_department_idTodepartments": {
      "id": 1,
      "department_code": "CNTT",
      "department_name": "Khoa Công nghệ thông tin"
    },
    "instructor_assignments": [
      {
        "supervision_quota": 4,
        "current_load": 2,
        "notes": "Chuyên gia React"
      }
    ]
  }
]
```

**Lưu ý:**
- `instructor_assignments` chỉ được trả về khi có `thesis_round_id` trong query
- `supervision_quota`: Số lượng đồ án tối đa giảng viên có thể hướng dẫn
- `current_load`: Số lượng đồ án hiện tại giảng viên đang hướng dẫn

---

### 2. Get Instructor by ID
Lấy thông tin chi tiết giáo viên theo ID

- **Endpoint:** `GET /api/instructors/:id`

**Example:**
```bash
GET http://localhost:3000/api/instructors/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "instructor_code": "GV001",
  "department_id": 1,
  "degree": "Tiến sĩ",
  "academic_title": "Giảng viên chính",
  "specialization": "Trí tuệ nhân tạo",
  "years_of_experience": 5,
  "status": true,
  "users": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "avatar": "https://example.com/avatar.jpg"
  },
  "departments_instructors_department_idTodepartments": {
    "id": 1,
    "department_code": "CNTT",
    "department_name": "Khoa Công nghệ thông tin"
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

### 3. Create Instructor
Tạo mới giáo viên hướng dẫn

- **Endpoint:** `POST /api/instructors`
- **Request Body:**
```json
{
  "instructor_code": "GV003",
  "department_id": 1,
  "degree": "Thạc sĩ",
  "academic_title": "Giảng viên",
  "specialization": "Phát triển Mobile",
  "years_of_experience": 2,
  "username": "gv003",
  "password": "password123",
  "email": "gv003@example.com",
  "full_name": "Lê Văn C",
  "phone": "0901112222"
}
```

**Lưu ý:**
- `instructor_code`: Mã giảng viên (phải là duy nhất)
- `username`: Tên đăng nhập (phải là duy nhất)
- `password`: Mật khẩu (sẽ được hash tự động)
- `department_id`: ID của khoa/bộ môn

**Response (201 Created):**
```json
{
  "id": 3,
  "instructor_code": "GV003",
  "department_id": 1,
  "degree": "Thạc sĩ",
  "academic_title": "Giảng viên",
  "specialization": "Phát triển Mobile",
  "years_of_experience": 2,
  "status": true,
  "users": {
    "id": 3,
    "full_name": "Lê Văn C",
    "email": "gv003@example.com",
    "phone": "0901112222",
    "avatar": null
  },
  "departments_instructors_department_idTodepartments": {
    "id": 1,
    "department_code": "CNTT",
    "department_name": "Khoa Công nghệ thông tin"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Mã giảng viên đã tồn tại"
}
```

hoặc

```json
{
  "error": "Username đã tồn tại"
}
```

---

## Error Responses

### 404 Not Found
```json
{
  "error": "Không tìm thấy giảng viên"
}
```

### 500 Internal Server Error
```json
{
  "error": "Lỗi lấy danh sách giảng viên"
}
```

---

## Usage Examples

### Frontend - Lấy tất cả giảng viên
```javascript
fetch('http://localhost:3000/api/instructors')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Frontend - Lấy giảng viên theo đợt đồ án
```javascript
const thesisRoundId = 1;
fetch(`http://localhost:3000/api/instructors?thesis_round_id=${thesisRoundId}`)
  .then(response => response.json())
  .then(data => {
    // Filter instructors with available quota
    const availableInstructors = data.filter(
      instructor => instructor.instructor_assignments[0].current_load < instructor.instructor_assignments[0].supervision_quota
    );
    console.log(availableInstructors);
  })
  .catch(error => console.error(error));
```

### Frontend - Tìm kiếm giảng viên
```javascript
const searchTerm = 'Nguyen';
fetch(`http://localhost:3000/api/instructors?search=${searchTerm}`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Frontend - Lấy chi tiết giảng viên
```javascript
const instructorId = 1;
fetch(`http://localhost:3000/api/instructors/${instructorId}`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Frontend - Tạo giảng viên mới
```javascript
fetch('http://localhost:3000/api/instructors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    instructor_code: 'GV004',
    department_id: 1,
    degree: 'Tiến sĩ',
    academic_title: 'Giảng viên chính',
    specialization: 'Machine Learning',
    years_of_experience: 6,
    username: 'gv004',
    password: 'password123',
    email: 'gv004@example.com',
    full_name: 'Phạm Văn D',
    phone: '0903334444'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Frontend - React Component Example
```jsx
import { useState, useEffect } from 'react';

function InstructorList({ thesisRoundId }) {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const url = thesisRoundId 
          ? `http://localhost:3000/api/instructors?thesis_round_id=${thesisRoundId}`
          : 'http://localhost:3000/api/instructors';
        
        const response = await fetch(url);
        const data = await response.json();
        setInstructors(data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [thesisRoundId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Danh sách Giáo Viên Hướng Dẫn</h2>
      <ul>
        {instructors.map(instructor => (
          <li key={instructor.id}>
            <h3>{instructor.users.full_name}</h3>
            <p>Mã GV: {instructor.instructor_code}</p>
            <p>Khoa: {instructor.departments_instructors_department_idTodepartments.department_name}</p>
            <p>Chuyên môn: {instructor.specialization}</p>
            <p>Email: {instructor.users.email}</p>
            {instructor.instructor_assignments && (
              <p>
                Số đồ án: {instructor.instructor_assignments[0].current_load} / {instructor.instructor_assignments[0].supervision_quota}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InstructorList;
```

---

## Common Use Cases

### 1. Hiển thị danh sách giảng viên cho sinh viên chọn hướng dẫn
```javascript
// Lấy giảng viên theo đợt đồ án hiện tại
const thesisRoundId = getCurrentThesisRoundId();
fetch(`http://localhost:3000/api/instructors?thesis_round_id=${thesisRoundId}`)
  .then(response => response.json())
  .then(instructors => {
    // Hiển thị giảng viên còn chỗ trống
    const available = instructors.filter(
      i => i.instructor_assignments[0].current_load < i.instructor_assignments[0].supervision_quota
    );
    displayInstructors(available);
  });
```

### 2. Tìm kiếm giảng viên theo tên
```javascript
function searchInstructors(query) {
  fetch(`http://localhost:3000/api/instructors?search=${query}`)
    .then(response => response.json())
    .then(data => updateInstructorList(data));
}
```

### 3. Lọc giảng viên theo khoa
```javascript
function filterByDepartment(departmentId) {
  fetch(`http://localhost:3000/api/instructors?department_id=${departmentId}`)
    .then(response => response.json())
    .then(data => updateInstructorList(data));
}
```
