# Guidance Process API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Tất cả các request cần gửi JWT token trong header:
```
Authorization: Bearer <token>
```

**Note:** API này chỉ dành cho Admin.

---

## 1. Add Guidance Process
Thêm quy trình hướng dẫn cho đợt đồ án

**Endpoint:** `POST /api/admin/thesis-rounds/:id/guidance-process`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (required): ID của đợt đồ án

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
    "expected_outcome": "string",
    "status": "boolean",
    "created_at": "datetime"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Lỗi thêm quy trình hướng dẫn"
}
```

**Example Request:**
```bash
POST /api/admin/thesis-rounds/1/guidance-process
Content-Type: application/json

{
  "processes": [
    {
      "week_number": 1,
      "phase_name": "Giai đoạn khởi động",
      "work_description": "Sinh viên chọn đề tài và đăng ký nhóm",
      "expected_outcome": "Đã đăng ký đề tài và nhóm thành công"
    },
    {
      "week_number": 2,
      "phase_name": "Giai đoạn nghiên cứu",
      "work_description": "Nghiên cứu tài liệu và xây dựng kế hoạch",
      "expected_outcome": "Hoàn thành kế hoạch chi tiết"
    },
    {
      "week_number": 3,
      "phase_name": "Giai đoạn triển khai",
      "work_description": "Triển khai và phát triển sản phẩm",
      "expected_outcome": "Hoàn thành sản phẩm cơ bản"
    },
    {
      "week_number": 4,
      "phase_name": "Giai đoạn hoàn thiện",
      "work_description": "Hoàn thiện sản phẩm và viết báo cáo",
      "expected_outcome": "Hoàn thành báo cáo cuối cùng"
    }
  ]
}
```

---

## 2. Get Guidance Processes
Lấy danh sách quy trình hướng dẫn của đợt đồ án

**Endpoint:** `GET /api/admin/thesis-rounds/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (required): ID của đợt đồ án

**Response (200 OK):**
```json
{
  "id": "number",
  "semester": "string",
  "round_name": "string",
  "status": "DRAFT|ACTIVE|COMPLETED",
  "guidance_processes": [
    {
      "id": "number",
      "thesis_round_id": "number",
      "week_number": "number",
      "phase_name": "string",
      "work_description": "string",
      "expected_outcome": "string",
      "status": "boolean",
      "created_at": "datetime"
    }
  ],
  ...
}
```

**Example Request:**
```bash
GET /api/admin/thesis-rounds/1
```

---

## Error Responses

**Error Response (500):**
```json
{
  "error": "Lỗi thêm quy trình hướng dẫn"
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

### 1. Admin tạo quy trình hướng dẫn cho đợt đồ án mới
Khi admin tạo một đợt đồ án mới, cần thiết lập quy trình hướng dẫn để sinh viên và giảng viên theo dõi tiến độ.

**Request:**
```bash
POST /api/admin/thesis-rounds/1/guidance-process
```

**Response:** Danh sách các quy trình hướng dẫn đã được thêm thành công.

### 2. Xem quy trình hướng dẫn của đợt đồ án
Khi cần xem hoặc chỉnh sửa quy trình hướng dẫn của một đợt đồ án cụ thể.

**Request:**
```bash
GET /api/admin/thesis-rounds/1
```

**Response:** Chi tiết đợt đồ án bao gồm danh sách quy trình hướng dẫn.

### 3. Theo dõi tiến độ theo quy trình
Sinh viên và giảng viên có thể xem quy trình hướng dẫn để biết được các giai đoạn cần hoàn thành trong từng tuần.

**Request:**
```bash
GET /api/admin/thesis-rounds/1
```

**Response:** Danh sách các giai đoạn với tuần tương ứng, mô tả công việc và kết quả mong đợi.

---

## Notes

- Mỗi đợt đồ án có thể có nhiều quy trình hướng dẫn cho các tuần khác nhau
- `week_number` phải là duy nhất cho mỗi đợt đồ án
- `status` mặc định là `true` khi tạo mới
- API này chỉ dành cho Admin, các role khác không có quyền truy cập
