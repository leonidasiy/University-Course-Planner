import * as React from 'react';
import { SemesterCard } from './SemesterCard';
import { Semester, Course } from '../types/schedule';

interface SemesterListProps {
  semesters: Semester[];
  availableCourses: Course[];
  onRemoveSemester: (semesterId: string) => void;
  onClearSemesterCourses: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  onToggleCompletion: (courseId: string) => void;
}

export function SemesterList({
  semesters,
  availableCourses,
  onRemoveSemester,
  onClearSemesterCourses,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse,
  onToggleCompletion
}: SemesterListProps) {
  if (semesters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No semesters added yet. Click "Add Semester" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Academic Schedule</h2>
      
      <div className="grid gap-6">
        {semesters.map((semester) => (
          <div key={semester.id} data-semester-id={semester.id}>
            <SemesterCard
              semester={semester}
              availableCourses={availableCourses}
              onRemove={onRemoveSemester}
              onClearCourses={onClearSemesterCourses}
              onAddCourse={onAddCourse}
              onRemoveCourse={onRemoveCourse}
              onMoveCourse={onMoveCourse}
              onToggleCompletion={onToggleCompletion}
            />
          </div>
        ))}
      </div>
    </div>
  );
}