export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  majorRequirements: string[]; // Changed from hardcoded union to dynamic string array
  isCompleted: boolean;
  category: 'Prerequisites' | 'Major Requirements' | 'Electives' | 'Other';
}

export interface Semester {
  id: string;
  name: string;
  type: 'Fall' | 'Winter' | 'Spring' | 'Summer';
  year: number;
  courses: Course[];
}

export interface ScheduleData {
  semesters: Semester[];
  availableCourses: Course[];
}