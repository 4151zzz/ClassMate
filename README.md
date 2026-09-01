# 🎓 ClassMate Practicum - เว็บไซต์รายงานการฝึกประสบการณ์วิชาชีพครู

พอร์ตโฟลิโอและระบบรายงานผลการปฏิบัติการสอนในสถานศึกษา (Teaching Practicum Portfolio & Schedule System) สวยหรู สไตล์ Glassmorphism รองรับการใช้งานทั้งคอมพิวเตอร์และโทรศัพท์มือถือ

---

## ✨ ฟีเจอร์เด่น (Key Features)

- 💎 **Modern Glassmorphism UI**: ดีไซน์หรูหรา ธีม Dark/Light Mode สลับได้อิสระ
- 👤 **ระบบจัดการบัญชีนักศึกษา (Multi-User Authentication)**: ลงทะเบียน/เข้าสู่ระบบด้วยรหัสนักศึกษา แยกข้อมูลของแต่ละคนออกจากกัน 100%
- 📅 **ตารางสอนประจำสัปดาห์ (Weekly Timetable Board)**: แสดงตารางสอน 5 วัน (จันทร์ - ศุกร์) พร้อมปุ่มเปิดดูแผนการสอนแบบด่วน
- 📄 **อัปโหลดและพรีวิวแผนการสอน PDF (Interactive PDF Previewer)**: รองรับการอัปโหลดไฟล์ PDF พร้อมตัวพรีวิวและดาวน์โหลดในเว็บ
- ☁️ **Google Drive Auto-Sync Bridge**: อัปโหลดรูปภาพและไฟล์จากเครื่องตรงเข้า Google Drive ของคุณโดยอัตโนมัติ
- 📱 **Mobile-First Responsive**: ปรับแต่งขนาดและการจัดวางให้สวยงามสมบูรณ์แบบบนสมาร์ตโฟนและแท็บเล็ต
- 🔗 **QR Code & Link Sharing**: แชร์ลิงก์พอร์ตโฟลิโอเฉพาะบุคคลให้ครูพี่เลี้ยงและอาจารย์นิเทศก์เปิดดูในโหมดผู้เข้าชม (Read-Only)
- 💾 **ระบบสำรองข้อมูล (JSON Export / Import)**: ส่งออกและนำเข้าข้อมูลได้ในคลิกเดียว

---

## 🚀 วิธีการใช้งาน

1. เปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์ (Chrome, Edge, Safari, Firefox)
2. กดปุ่ม **"เข้าสู่ระบบ / ลงทะเบียน"** เพื่อสร้างโปรไฟล์นักศึกษาของคุณ
3. แก้ไขข้อมูลส่วนตัว ข้อมูลสถานศึกษา ครูพี่เลี้ยง ตารางสอน และอัปโหลดภาพกิจกรรมได้ตามต้องการ

---

## 🛠️ โครงสร้างไฟล์ (Project Structure)

```
classMate/
├── index.html          # หน้าหลักของเว็บแอปพลิเคชัน
├── css/
│   ├── main.css        # สไตล์ระบบ Glassmorphism & UI Components
│   ├── animations.css  # Micro-animations & Glow Effects
│   └── responsive.css  # Responsive styles สำหรับมือถือและแท็บเล็ต
└── js/
    ├── mockData.js     # โครงสร้างข้อมูลตั้งต้น
    ├── auth.js         # ระบบ Authentication & Multi-User
    ├── storage.js      # LocalStorage & IndexedDB Manager
    ├── gdrive.js       # Google Drive Cloud Integration
    ├── gallery.js      # ระบบแกลเลอรีภาพและ Lightbox
    ├── share.js        # ระบบสร้าง QR Code และแชร์ลิงก์
    └── app.js          # Main Application Controller
```
