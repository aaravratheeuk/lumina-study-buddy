
export enum AppTab {
  DASHBOARD = 'dashboard',
  HOMEWORK = 'homework',
  DIAGRAMS = 'diagrams',
  TUTOR = 'tutor',
  LOGS = 'logs',
  PRACTICE = 'practice'
}

export interface User {
  id: string;
  name: string;
  email: string;
  yearGroup: string;
  targetGrade: string;
  avatar: string;
  joinDate: string;
  syllabusMastery: Record<string, number>;
  xp: number;
  secretCode?: string;
}

export interface LearningLog {
  id: string;
  userId: string;
  date: string; // ISO string
  summary: string;
  subject: string;
  mood: string;
  duration: number; // in minutes
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudentRosterItem {
  name: string;
  email: string;
}

export interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  studentEmails: string[];
  createdAt: string;
}
