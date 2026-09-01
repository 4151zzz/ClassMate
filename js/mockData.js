/**
 * ClassMate Practicum - Clean Production Template Data
 */
const DEFAULT_PRACTICUM_DATA = {
  student: {
    fullName: "ชื่อ - สกุล นักศึกษาปฏิบัติการสอน",
    studentId: "XXXXXXXXXXX",
    major: "สาขาวิชา...",
    faculty: "คณะครุศาสตร์ / ศึกษาศาสตร์",
    university: "มหาวิทยาลัย...",
    academicYear: "ปีการศึกษา 2568",
    status: "นักศึกษาฝึกประสบการณ์วิชาชีพครู",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    coverPhoto: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    quote: "“คำคม / ปรัชญาและคติประจำใจในการจัดการเรียนรู้”",
    bio: "ระบุประวัติ ความมุ่งมั่น และแนวทางการจัดการเรียนรู้เชิงรุก (Active Learning) ของคุณที่นี่...",
    tags: ["ครูฝึกสอน", "Active Learning", "ปีการศึกษา 2568"],
    totalHours: 360,
    completedHours: 0,
    lessonPlansCount: 0,
    classesTaught: "ระบุระดับชั้นที่สอน",
    email: "your.email@edu.ac.th",
    phone: "08X-XXX-XXXX"
  },

  competencies: [
    {
      id: "comp-1",
      title: "การคิดขั้นสูง (Higher-Order Thinking)",
      desc: "ส่งเสริมกระบวนการคิดวิเคราะห์ การแก้ปัญหา และความคิดสร้างสรรค์",
      icon: "fa-brain",
      color: "var(--primary-500)"
    },
    {
      id: "comp-2",
      title: "ทักษะดิจิทัลและเทคโนโลยี (Digital Literacy)",
      desc: "การประยุกต์ใช้เทคโนโลยีสารสนเทศในการเรียนรู้อย่างสร้างสรรค์และปลอดภัย",
      icon: "fa-laptop-code",
      color: "var(--accent-purple)"
    },
    {
      id: "comp-3",
      title: "การทำงานร่วมกันและสื่อสาร (Collaboration)",
      desc: "ส่งเสริมการทำงานเป็นทีม ภาวะผู้นำ และการสื่อสารอย่างมีประสิทธิภาพ",
      icon: "fa-users",
      color: "var(--accent-emerald)"
    }
  ],

  school: {
    nameTh: "ชื่อโรงเรียน / สถานศึกษาที่ปฏิบัติการสอน",
    nameEn: "School Name (English)",
    badge: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=300&q=80",
    motto: "“คำขวัญ / อัตลักษณ์ของสถานศึกษา”",
    vision: "วิสัยทัศน์และพันธกิจของโรงเรียนในการพัฒนาผู้เรียน...",
    address: "ที่ตั้งสถานศึกษา เลขที่... ถนน... แขวง/ตำบล... เขต/อำเภอ... จังหวัด... รหัสไปรษณีย์...",
    phone: "02-XXX-XXXX",
    email: "contact@school.ac.th",
    website: "https://www.school.ac.th",
    director: "ชื่อผู้อำนวยการสถานศึกษา",
    mapUrl: "",
    affiliation: "สังกัด สพฐ. / สกอ."
  },

  mentors: [],
  faculty: [],
  timetable: [],
  teachingLogs: [],
  gallery: [],
  studentShowcases: []
};
