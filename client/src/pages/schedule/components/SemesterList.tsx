import * as React from 'react';
import { SemesterCard } from './SemesterCard';
import { Semester, Course } from '../types/schedule';
import { Major } from '../types/major';

interface SemesterListProps {
  semesters: Semester[];
  availableCourses: Course[];
  selectedCourses: Set<string>;
  majors: Major[];
  onSelect: (courseId: string, isSelected: boolean) => void;
  onSelectAll: (courses: Course[]) => void;
  onClearSelection: () => void;
  onRemoveSemester: (semesterId: string) => void;
  onClearSemesterCourses: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onInsertCourseAtPosition: (semesterId: string, course: Course, position: number) => void;
  onAddSelectedCourses: (semesterId: string) => void;
  onInsertSelectedCoursesAtPosition: (semesterId: string, position: number) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onRemoveSelectedCourses: (semesterId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  onMoveCourseToPosition: (fromSemesterId: string, toSemesterId: string, courseId: string, position: number) => void;
  onMoveSelectedCourses: (fromSemesterId: string, toSemesterId: string) => void;
  onMoveSelectedCoursesToPosition: (fromSemesterId: string, toSemesterId: string, position: number) => void;
  onReorderCourses: (semesterId: string, dragIndex: number, dropIndex: number) => void;
  onToggleCompletion: (courseId: string) => void;
  onToggleSelectedCompletion: (completed: boolean) => void;
  onUpdateSemesterName?: (semesterId: string, newName: string) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
}

export function SemesterList({
  semesters,
  availableCourses,
  selectedCourses,
  majors,
  onSelect,
  onSelectAll,
  onClearSelection,
  onRemoveSemester,
  onClearSemesterCourses,
  onAddCourse,
  onInsertCourseAtPosition,
  onAddSelectedCourses,
  onInsertSelectedCoursesAtPosition,
  onRemoveCourse,
  onRemoveSelectedCourses,
  onMoveCourse,
  onMoveCourseToPosition,
  onMoveSelectedCourses,
  onMoveSelectedCoursesToPosition,
  onReorderCourses,
  onToggleCompletion,
  onToggleSelectedCompletion,
  onUpdateSemesterName,
  onUpdateCourse
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
              selectedCourses={selectedCourses}
              majors={majors}
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              onClearSelection={onClearSelection}
              onRemove={onRemoveSemester}
              onClearCourses={onClearSemesterCourses}
              onAddCourse={onAddCourse}
              onInsertCourseAtPosition={onInsertCourseAtPosition}
              onAddSelectedCourses={onAddSelectedCourses}
              onInsertSelectedCoursesAtPosition={onInsertSelectedCoursesAtPosition}
              onRemoveCourse={onRemoveCourse}
              onRemoveSelectedCourses={onRemoveSelectedCourses}
              onMoveCourse={onMoveCourse}
              onMoveCourseToPosition={onMoveCourseToPosition}
              onMoveSelectedCourses={onMoveSelectedCourses}
              onMoveSelectedCoursesToPosition={onMoveSelectedCoursesToPosition}
              onReorderCourses={onReorderCourses}
              onToggleCompletion={onToggleCompletion}
              onToggleSelectedCompletion={onToggleSelectedCompletion}
              onUpdateSemesterName={onUpdateSemesterName}
              onUpdateCourse={onUpdateCourse}
            />
          </div>
        ))}
      </div>
    </div>
  );
}