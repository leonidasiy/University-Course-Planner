import * as React from 'react';
import { SemesterCard } from './SemesterCard';
import { Semester, Course } from '../types/schedule';

interface SemesterListProps {
  semesters: Semester[];
  availableCourses: Course[];
  selectedCourses: Set<string>;
  onSelect: (courseId: string, isSelected: boolean) => void;
  onSelectAll: (courses: Course[]) => void;
  onClearSelection: () => void;
  onRemoveSemester: (semesterId: string) => void;
  onClearSemesterCourses: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onAddSelectedCourses: (semesterId: string) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onRemoveSelectedCourses: (semesterId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  onMoveSelectedCourses: (fromSemesterId: string, toSemesterId: string) => void;
  onToggleCompletion: (courseId: string) => void;
  onToggleSelectedCompletion: (completed: boolean) => void;
  onUpdateSemesterName?: (semesterId: string, newName: string) => void;
}

export function SemesterList({
  semesters,
  availableCourses,
  selectedCourses,
  onSelect,
  onSelectAll,
  onClearSelection,
  onRemoveSemester,
  onClearSemesterCourses,
  onAddCourse,
  onAddSelectedCourses,
  onRemoveCourse,
  onRemoveSelectedCourses,
  onMoveCourse,
  onMoveSelectedCourses,
  onToggleCompletion,
  onToggleSelectedCompletion,
  onUpdateSemesterName
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
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              onClearSelection={onClearSelection}
              onRemove={onRemoveSemester}
              onClearCourses={onClearSemesterCourses}
              onAddCourse={onAddCourse}
              onAddSelectedCourses={onAddSelectedCourses}
              onRemoveCourse={onRemoveCourse}
              onRemoveSelectedCourses={onRemoveSelectedCourses}
              onMoveCourse={onMoveCourse}
              onMoveSelectedCourses={onMoveSelectedCourses}
              onToggleCompletion={onToggleCompletion}
              onToggleSelectedCompletion={onToggleSelectedCompletion}
              onUpdateSemesterName={onUpdateSemesterName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}