export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface ScheduleData {
  semesters: Semester[];
  availableCourses: Course[];
}