export interface Database {
  courses: CoursesTable;
  semesters: SemestersTable;
  semester_courses: SemesterCoursesTable;
  major_settings: MajorSettingsTable;
}

export interface CoursesTable {
  id: string;
  code: string;
  name: string;
  credits: number;
  major_requirements: string; // JSON string array
  is_completed: number; // SQLite boolean (0 or 1)
  category: string; // Prerequisites, Major Requirements, Electives
  created_at: string;
  updated_at: string;
}

export interface SemestersTable {
  id: string;
  name: string;
  type: 'Fall' | 'Winter' | 'Spring' | 'Summer';
  year: number;
  created_at: string;
  updated_at: string;
}

export interface SemesterCoursesTable {
  id: number;
  semester_id: string;
  course_id: string;
  order_index: number;
  created_at: string;
}

export interface MajorSettingsTable {
  id: string;
  name: string;
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}