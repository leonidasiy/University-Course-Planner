import * as React from 'react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { SemesterList } from './components/SemesterList';
import { CourseLibrary } from './components/CourseLibrary';
import { CourseSearch } from './components/CourseSearch';
import { useSchedule } from './hooks/useSchedule';

export function SchedulePage() {
  const {
    semesters,
    availableCourses,
    isLoading,
    addSemester,
    removeSemester,
    clearSemesterCourses,
    addCourseToSemester,
    removeCourseFromSemester,
    moveCourse,
    addCourseToLibrary,
    removeCourseFromLibrary,
    toggleCourseCompletion,
    searchCourseInSemesters,
    totalCredits,
    completedCredits,
    requirementCredits
  } = useSchedule();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ScheduleHeader
        totalCredits={totalCredits}
        completedCredits={completedCredits}
        requirementCredits={requirementCredits}
        onAddSemester={addSemester}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <SemesterList
            semesters={semesters}
            availableCourses={availableCourses}
            onRemoveSemester={removeSemester}
            onClearSemesterCourses={clearSemesterCourses}
            onAddCourse={addCourseToSemester}
            onRemoveCourse={removeCourseFromSemester}
            onMoveCourse={moveCourse}
            onToggleCompletion={toggleCourseCompletion}
          />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <CourseSearch onSearch={searchCourseInSemesters} />
          
          <CourseLibrary
            courses={availableCourses}
            onAddCourse={addCourseToLibrary}
            onRemoveCourse={removeCourseFromLibrary}
            onToggleCompletion={toggleCourseCompletion}
          />
        </div>
      </div>
    </div>
  );
}