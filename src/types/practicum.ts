export interface StudentProfile {
  fullName: string;
  studentId: string;
  major: string;
  faculty: string;
  university: string;
  academicYear: string;
  status: string;
  avatar: string;
  coverPhoto: string;
  quote: string;
  bio: string;
  tags: string[];
  totalHours: number;
  completedHours: number;
  lessonPlansCount: number;
  classesTaught: string;
  email: string;
  phone: string;
}

export interface Competency {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
}

export interface SchoolInfo {
  nameTh: string;
  nameEn: string;
  badge: string;
  motto: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  director: string;
  mapUrl: string;
  affiliation: string;
}

export interface Mentor {
  id: string;
  name: string;
  roleTitle: string;
  roleType: 'mentor' | 'supervisor';
  position: string;
  department: string;
  comment?: string;
  phone?: string;
  email?: string;
  avatar: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  position: string;
  department: string;
  phone?: string;
  email?: string;
  avatar: string;
}

export interface TimetableSlot {
  id: string;
  day: 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์' | string;
  period: number;
  time: string;
  subjectCode: string;
  subjectName: string;
  grade: string;
  room: string;
  planId?: string;
}

export interface TeachingLog {
  id: string;
  week: string;
  date: string;
  hours: number;
  title: string;
  description: string;
  subject: string;
  grade: string;
  status: string;
  objectives?: string;
  steps?: string;
  planLink?: string;
  pdfDataUrl?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: 'all' | 'classroom' | 'activities' | 'projects' | 'events' | string;
  date?: string;
}

export interface StudentShowcase {
  id: string;
  title: string;
  studentNames: string;
  award: string;
  image: string;
}

export interface PracticumData {
  student: StudentProfile;
  competencies: Competency[];
  school: SchoolInfo;
  mentors: Mentor[];
  faculty: FacultyMember[];
  timetable: TimetableSlot[];
  teachingLogs: TeachingLog[];
  gallery: GalleryItem[];
  studentShowcases: StudentShowcase[];
  showcases?: StudentShowcase[];
}
