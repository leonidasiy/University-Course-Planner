import * as React from 'react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { SemesterList } from './components/SemesterList';
import { CourseLibrary } from './components/CourseLibrary';
import { useSchedule } from './hooks/useSchedule';

export function SchedulePage() {
  const {
    semesters,
    availableCourses,
    addSemester,
    removeSemester,
    addCourseToSemester,
    removeCourseFromSemester,
    moveCourse,
    addCourseToLibrary,
    removeCourseFromLibrary,
    totalCredits,
    completedCredits
  } = useSchedule();

  return (
    <div className="container mx-auto px-4 py-8">
      <ScheduleHeader
        totalCredits={totalCredits}
        completedCredits={completedCredits}
        onAddSemester={addSemester}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <SemesterList
            semesters={semesters}
            onRemoveSemester={removeSemester}
            onAddCourse={addCourseToSemester}
            onRemoveCourse={removeCourseFromSemester}
            onMoveCourse={moveCourse}
          />
        </div>
        
        <div className="lg:col-span-1">
          <CourseLibrary
            courses={availableCourses}
            onAddCourse={addCourseToLibrary}
            onRemoveCourse={removeCourseFromLibrary}
          />
        </div>
      </div>
    </div>
  );
}