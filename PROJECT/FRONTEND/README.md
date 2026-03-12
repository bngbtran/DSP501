# ADPIS - Audio Digital Processing & Intelligence System Frontend

Frontend cho dự án cuối kỳ môn **Xử lý Tín hiệu Số (DSP501)**.  
Hệ thống cung cấp **giao diện người dùng** để upload audio, điều chỉnh **Equalizer**, gửi dữ liệu sang backend và hiển thị kết quả xử lý.

Frontend **không thực hiện xử lý tín hiệu số (DSP)**, toàn bộ DSP và Machine Learning được xử lý ở backend.

---

## 1. Chức năng chính

### 🎵 Audio Upload

- Upload **một hoặc nhiều file audio** cùng lúc
- Hỗ trợ các định dạng phổ biến: `.wav`, `.mp3`
- Mỗi file audio được quản lý độc lập trong hệ thống

---

### 🎚️ Audio Equalizer

- Điều chỉnh Equalizer cho **từng track riêng biệt**
- Các dải tần được chia với các tần số tương ứng
- Thông số Equalizer được gửi sang backend để xử lý DSP

---

### ▶️ Audio Playback

- Phát audio gốc (chưa xử lý)
- Phát audio sau khi backend xử lý Equalizer
- So sánh trực tiếp trước và sau xử lý

---

### 🎵 Music Genre Classification

- Gửi file audio sang backend để phân loại dòng nhạc
- Hiển thị:
  - Thể loại nhạc dự đoán
  - Độ tin cậy của kết quả

---

### 🔗 Kết nối Backend

- Giao tiếp với backend thông qua **REST API**
- Gửi:
  - File audio
  - Thông số Equalizer
- Nhận:
  - File audio đã xử lý
  - Kết quả phân loại dòng nhạc

---

## 2. Cấu trúc thư mục

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── audio/
│   │   │   ├── AudioUpload.tsx      # Upload audio
│   │   │   ├── AudioItem.tsx        # Quản lý từng file audio
│   │   │   ├── EqualizerPanel.tsx   # Điều chỉnh Bass / Mid / Treble
│   │   │   └── AudioPlayer.tsx      # Phát audio
│   │   │
│   │   └── ui/                      # Component từ shadcn/ui
│   │
│   ├── pages/
│   │   └── Home.tsx                 # Trang chính
│   │
│   ├── services/
│   │   └── api.ts                   # Gọi backend API
│   │
│   ├── types/
│   │   └── audio.ts                 # Kiểu dữ liệu audio
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 3. Yêu cầu hệ thống

- Node.js **18+**
- npm hoặc yarn
- Hệ điều hành: Windows / macOS / Linux

---

## 4. Hướng dẫn cài đặt & chạy

### 4.1 Cài đặt thư viện

```bash
npm install
```

---

### 4.2 Chạy frontend

```bash
npm run dev
```

Mở trình duyệt tại:

```
http://localhost:5173
```

---

## 5. Luồng xử lý Frontend – Backend

1. Người dùng upload audio từ frontend
2. Frontend tạo từng Audio Track riêng biệt
3. Người dùng điều chỉnh Equalizer cho từng track
4. Frontend gửi file audio + thông số Equalizer sang backend
5. Backend xử lý DSP và trả về audio kết quả
6. Frontend phát audio sau xử lý

---

## 6. Ghi chú

- Frontend **chỉ xử lý giao diện**
- Không thực hiện xử lý DSP hay Machine Learning
- Mỗi file audio được xử lý **độc lập**
- Frontend được thiết kế để tương thích trực tiếp với backend ADPIS

---

## 7. Công nghệ sử dụng

- React (Vite)
- TypeScript
- Tailwind CSS
- shadcn/ui
- HTML5 Audio API

---

## 8. Tác giả

1. Nguyễn Văn Tú
2. Bùi Ngọc Bảo Trân
3. Lê Ngọc Hiếu
4. Lê Bảo Nguyên
