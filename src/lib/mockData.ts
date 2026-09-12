import { PracticumData } from "@/types/practicum";

export const DEFAULT_PRACTICUM_DATA: PracticumData = {
  student: {
    fullName: "นายธนกฤต วิริยปัญญา",
    studentId: "64011234056",
    major: "สาขาวิชาคอมพิวเตอร์ศึกษา (วิทยาการคำนวณ)",
    faculty: "คณะครุศาสตร์",
    university: "มหาวิทยาลัยราชภัฏสวนสุนันทา",
    academicYear: "ปีการศึกษา 2568",
    status: "นักศึกษาปฏิบัติการสอนในสถานศึกษา 1",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    coverPhoto: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    quote: "“การศึกษาไม่ใช่แค่การเตรียมตัวสำหรับชีวิต แต่การศึกษาคือชีวิตในตัวมันเอง (John Dewey)”",
    bio: "มุ่งมั่นสร้างสรรค์สภาพแวดล้อมการเรียนรู้เชิงรุก (Active Learning) บูรณาการปัญญาประดิษฐ์ (AI) และวิทยาการคำนวณ เพื่อบ่มเพาะทักษะแห่งศตวรรษที่ 21 ให้แก่ผู้เรียนอย่างมีความสุขและยั่งยืน",
    tags: ["ครูฝึกสอน", "วิทยาการคำนวณ", "Active Learning", "AI & EdTech", "ปีการศึกษา 2568"],
    totalHours: 360,
    completedHours: 240,
    lessonPlansCount: 16,
    classesTaught: "มัธยมศึกษาปีที่ 1 - 4",
    email: "thanakrit.wi@edu.ssru.ac.th",
    phone: "089-123-4567"
  },

  competencies: [
    {
      id: "comp-1",
      title: "การคิดขั้นสูง & การแก้ปัญหา (Computational Thinking)",
      desc: "ส่งเสริมกระบวนการคิดเชิงคำนวณ การแยกส่วนประกอบ การหารูปแบบ และการออกแบบอัลกอริทึม",
      icon: "Brain",
      color: "#00f0ff"
    },
    {
      id: "comp-2",
      title: "ทักษะดิจิทัลและเทคโนโลยี (Digital & AI Literacy)",
      desc: "การประยุกต์ใช้เครื่องมือดิจิทัลและ AI ในการสร้างสรรค์โครงงานอย่างมีจริยธรรมและปลอดภัย",
      icon: "Laptop",
      color: "#7000ff"
    },
    {
      id: "comp-3",
      title: "การทำงานร่วมกันและสื่อสาร (Collaboration & Leadership)",
      desc: "ส่งเสริมกระบวนการกลุ่ม การสื่อสารนำเสนอ และการรับฟังความคิดเห็นเพื่อพัฒนานวัตกรรม",
      icon: "Users",
      color: "#00ff88"
    }
  ],

  school: {
    nameTh: "โรงเรียนเตรียมอุดมศึกษาพัฒนาการ",
    nameEn: "Triam Udom Suksa Pattanakarn School",
    badge: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=300&q=80",
    motto: "“ความเป็นเลิศทางวิชาการ สื่อสารสองภาษา ล้ำหน้าทางความคิด ผลิตงานอย่างสร้างสรรค์”",
    vision: "มุ่งพัฒนาผู้เรียนให้เป็นพลโลกที่มีคุณภาพ มีคุณธรรม มีความรู้คู่เทคโนโลยี และดำรงตนตามหลักปรัชญาของเศรษฐกิจพอเพียง",
    address: "เลขที่ 444 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250",
    phone: "02-321-4888",
    email: "contact@tup.ac.th",
    website: "https://www.tup.ac.th",
    director: "ดร.จินตนา ศรีสวัสดิ์",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.875411786522!2d100.64024347590833!3d13.725997297893902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d61b369c7ebad%3A0x8848d7c2f0f423ab!2sTriam%20Udom%20Suksa%20Pattanakarn%20School!5e0!3m2!1sen!2sth!4v1700000000000!5m2!1sen!2sth",
    affiliation: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2 (สพฐ.)"
  },

  mentors: [
    {
      id: "mentor-1",
      name: "อาจารย์ ดร.กฤษดา มณีโรจน์",
      roleTitle: "อาจารย์นิเทศก์ประจำสถาบัน",
      roleType: "supervisor",
      position: "อาจารย์ประจำภาควิชาหลักสูตรและการสอน",
      department: "คณะครุศาสตร์ มหาวิทยาลัยราชภัฏสวนสุนันทา",
      comment: "นักศึกษามีความมุ่งมั่น ตั้งใจเตรียมการสอนเป็นอย่างดี มีการนำเทคโนโลยี EdTech เข้ามาประยุกต์ใช้ได้อย่างสร้างสรรค์",
      phone: "02-160-1234",
      email: "kritsada.ma@ssru.ac.th",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "mentor-2",
      name: "ครูสุภาภรณ์ ชัยประเสริฐ",
      roleTitle: "ครูพี่เลี้ยงประจำสถานศึกษา",
      roleType: "mentor",
      position: "ครูชำนาญการพิเศษ หัวหน้ากลุ่มสาระฯ",
      department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      comment: "สามารถควบคุมชั้นเรียนได้ดีเยี่ยม มีเทคนิคการสร้างแรงจูงใจและปฏิสัมพันธ์กับนักเรียนอย่างเป็นมิตร",
      phone: "081-987-6543",
      email: "supaporn.c@tup.ac.th",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    }
  ],

  faculty: [
    {
      id: "fac-1",
      name: "ดร.จินตนา ศรีสวัสดิ์",
      position: "ผู้อำนวยการโรงเรียน",
      department: "ฝ่ายบริหารงานทั่วไป",
      phone: "02-321-4888 ต่อ 101",
      email: "director@tup.ac.th",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "fac-2",
      name: "นายวรพจน์ กิตติคุณ",
      position: "รองผู้อำนวยการกลุ่มบริหารวิชาการ",
      department: "ฝ่ายวิชาการ",
      phone: "02-321-4888 ต่อ 102",
      email: "academic@tup.ac.th",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "fac-3",
      name: "นางสาวศิริพร บุญยืน",
      position: "ครูชำนาญการ วิทยาการคำนวณ",
      department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      phone: "084-555-1234",
      email: "siriporn.b@tup.ac.th",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "fac-4",
      name: "นายณัฐพล ศิริโชค",
      position: "ครูผู้ช่วย วิชาคอมพิวเตอร์",
      department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      phone: "089-777-8899",
      email: "nattapol.s@tup.ac.th",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    }
  ],

  timetable: [
    {
      id: "tt-1",
      day: "จันทร์",
      period: 2,
      time: "09:20 - 10:10",
      subjectCode: "ว22103",
      subjectName: "วิทยาการคำนวณ 2",
      grade: "ม.2/4",
      room: "Lab 502",
      planId: "log-1"
    },
    {
      id: "tt-2",
      day: "จันทร์",
      period: 4,
      time: "11:00 - 11:50",
      subjectCode: "ว31102",
      subjectName: "เทคโนโลยีสารสนเทศ",
      grade: "ม.4/1",
      room: "Lab 501",
      planId: "log-2"
    },
    {
      id: "tt-3",
      day: "อังคาร",
      period: 3,
      time: "10:10 - 11:00",
      subjectCode: "ว21103",
      subjectName: "วิทยาการคำนวณ 1",
      grade: "ม.1/2",
      room: "Lab 503",
      planId: "log-3"
    },
    {
      id: "tt-4",
      day: "พุธ",
      period: 5,
      time: "12:40 - 13:30",
      subjectCode: "ว22103",
      subjectName: "วิทยาการคำนวณ 2",
      grade: "ม.2/7",
      room: "Lab 502"
    },
    {
      id: "tt-5",
      day: "พฤหัสบดี",
      period: 1,
      time: "08:30 - 09:20",
      subjectCode: "ว21103",
      subjectName: "วิทยาการคำนวณ 1",
      grade: "ม.1/5",
      room: "Lab 503"
    },
    {
      id: "tt-6",
      day: "ศุกร์",
      period: 6,
      time: "13:30 - 14:20",
      subjectCode: "กิจกรรม",
      subjectName: "ชุมนุม AI & Robotics",
      grade: "มัธยมศึกษาตอนต้น",
      room: "Maker Space 401"
    }
  ],

  teachingLogs: [
    {
      id: "log-1",
      week: "สัปดาห์ที่ 1",
      date: "14 กรกฎาคม 2568",
      hours: 4,
      title: "การออกแบบอัลกอริทึมและการแก้ปัญหาด้วยผังงาน (Flowchart)",
      description: "จัดการเรียนรู้เชิงรุกให้นักเรียนวิเคราะห์สถานการณ์ปัญหาในชีวิตประจำวัน และเขียนผังงานเพื่อจำลองขั้นตอนการแก้ปัญหา",
      subject: "ว22103 วิทยาการคำนวณ 2",
      grade: "มัธยมศึกษาปีที่ 2",
      status: "ผ่านการนิเทศ",
      objectives: "1. นักเรียนสามารถอธิบายสัญลักษณ์และโครงสร้างของผังงานได้ถูกต้อง\n2. นักเรียนสามารถออกแบบผังงานแก้ปัญหาจากโจทย์ที่กำหนดให้ได้\n3. นักเรียนมีส่วนร่วมในการทำกิจกรรมกลุ่มและช่วยเหลือซึ่งกันและกัน",
      steps: "• ขั้นนำ (10 นาที): ชวนคิดด้วยปริศนาตรรกะและให้ตัวแทนเล่าขั้นตอนการเดินทางมาโรงเรียน\n• ขั้นสอน (35 นาที): บรรยายหลักการสัญลักษณ์ผังงาน และให้นักเรียนทำกิจกรรมจับคู่บัตรคำสั่ง\n• ขั้นสรุป (15 นาที): แต่ละกลุ่มนำเสนอผังงานหน้าชั้นเรียน และร่วมกันประเมินผล",
      planLink: "https://drive.google.com"
    },
    {
      id: "log-2",
      week: "สัปดาห์ที่ 2",
      date: "21 กรกฎาคม 2568",
      hours: 4,
      title: "การเขียนโปรแกรมภาษา Python เบื้องต้นและการประยุกต์ใช้",
      description: "ฝึกปฏิบัติการเขียนโค้ดตัวแปร ชนิดข้อมูล และการสร้างเงื่อนไข if-else เพื่อแก้โจทย์คำนวณเกรดและคิดค่าบริการ",
      subject: "ว31102 เทคโนโลยีสารสนเทศ",
      grade: "มัธยมศึกษาปีที่ 4",
      status: "ผ่านการนิเทศ",
      objectives: "1. เข้าใจโครงสร้างไวยากรณ์ภาษา Python\n2. เขียนโปรแกรมรับค่าและประมวลผลตามเงื่อนไขได้\n3. มีความกระตือรือร้นในการทดสอบและแก้บั๊กโค้ดด้วยตนเอง",
      steps: "• ขั้นนำ (10 นาที): สาธิตโปรแกรมตอบคำถามอัตโนมัติ (Chatbot อย่างง่าย)\n• ขั้นสอน (35 นาที): ให้นักเรียนเปิด Google Colab ทดลองเขียนโค้ดตามใบกิจกรรมแบบทีละสเต็ป\n• ขั้นสรุป (15 นาที): แข่งขัน Quiz Kahoot ประเมินความเข้าใจรวดเร็ว",
      planLink: "https://drive.google.com"
    },
    {
      id: "log-3",
      week: "สัปดาห์ที่ 3",
      date: "28 กรกฎาคม 2568",
      hours: 4,
      title: "ความปลอดภัยในโลกไซเบอร์และการรู้เท่าทันสื่อดิจิทัล (Cyber Hygiene)",
      description: "ศึกษาภัยคุกคามออนไลน์ ฟิชชิ่ง และแนวทางการปกป้องข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
      subject: "ว21103 วิทยาการคำนวณ 1",
      grade: "มัธยมศึกษาปีที่ 1",
      status: "ผ่านการนิเทศ",
      objectives: "1. รู้จักและระวังภัยคุกคามทางไซเบอร์ที่พบบ่อย\n2. ตั้งรหัสผ่านที่ปลอดภัยและการยืนยันตัวตนแบบ 2 ปัจจัย\n3. ปฏิบัติตนตามมารยาทดิจิทัล (Netiquette)",
      steps: "• ขั้นนำ (10 นาที): ชมคลิปจำลองการหลอกลวงดูดเงินทาง SMS และสนทนาแลกเปลี่ยน\n• ขั้นสอน (35 นาที): กิจกรรมสวมบทบาทเป็นนักสืบไซเบอร์จับผิดอีเมลปลอม\n• ขั้นสรุป (15 นาที): ทำโปสเตอร์อินโฟกราฟิกเตือนภัยแชร์ในชั้นเรียน",
      planLink: "https://drive.google.com"
    }
  ],

  gallery: [
    {
      id: "gal-1",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      title: "กิจกรรมจัดการเรียนรู้เชิงรุก Active Learning ห้องเรียน ม.2",
      category: "classroom",
      date: "15 ก.ค. 2568"
    },
    {
      id: "gal-2",
      url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      title: "การนิเทศการสอนโดยอาจารย์นิเทศก์และครูพี่เลี้ยง",
      category: "activities",
      date: "22 ก.ค. 2568"
    },
    {
      id: "gal-3",
      url: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80",
      title: "การจัดแสดงผลงานโครงงานสิ่งประดิษฐ์และหุ่นยนต์ AI",
      category: "projects",
      date: "05 ส.ค. 2568"
    },
    {
      id: "gal-4",
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      title: "กิจกรรมวันไหว้ครูและการมอบตัวเป็นศิษย์ ประจำปีการศึกษา 2568",
      category: "events",
      date: "20 มิ.ย. 2568"
    },
    {
      id: "gal-5",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      title: "บรรยากาศการระดมสมองและออกแบบ Coding ในห้องปฏิบัติการ",
      category: "classroom",
      date: "18 ก.ค. 2568"
    },
    {
      id: "gal-6",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      title: "การประชุมแลกเปลี่ยนเรียนรู้ PLC ประจำสัปดาห์ร่วมกับคณะครู",
      category: "activities",
      date: "12 ส.ค. 2568"
    }
  ],

  studentShowcases: [
    {
      id: "sc-1",
      title: "ระบบคัดแยกขยะอัจฉริยะด้วย AI Vision (Smart Waste Classifier)",
      studentNames: "ด.ช.ธนภัทร สุขสม และ ด.ญ.กัญญาณัฐ วงศ์วิจิตร (ม.2/4)",
      award: "รางวัลชนะเลิศ เหรียญทอง นวัตกรรม EdTech ระดับเขตพื้นที่การศึกษา",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "sc-2",
      title: "แอปพลิเคชันแจ้งเตือนฝุ่น PM 2.5 และความชื้นในโรงเรียนด้วย IoT",
      studentNames: "นายภานุเดช ศรีคำ และ นายวรเมธ คงเจริญ (ม.4/1)",
      award: "รางวัลชมเชย การประกวดสิ่งประดิษฐ์นักวิทยาศาสตร์รุ่นเยาว์ (YSC)",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "sc-3",
      title: "เกมส่งเสริมการเรียนรู้คำศัพท์ภาษาอังกฤษผ่าน Scratch & Python",
      studentNames: "ด.ญ.พิมพ์มาดา รัตนพร (ม.1/2)",
      award: "รางวัลเหรียญเงิน โครงงานคอมพิวเตอร์ประเภทซอฟต์แวร์ งานศิลปหัตถกรรมนักเรียน",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80"
    }
  ]
};
