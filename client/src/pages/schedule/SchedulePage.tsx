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
    selectedCourses,
    getSelectedCourses,
    toggleCourseSelection,
    selectCourse,
    deselectCourse,
    clearSelection,
    selectAllCourses,
    addSemester,
    updateSemesterName,
    removeSemester,
    clearSemesterCourses,
    addCourseToSemester,
    addSelectedCoursesToSemester,
    removeCourseFromSemester,
    removeSelectedCoursesFromSemester,
    moveCourse,
    moveSelectedCourses,
    addCourseToLibrary,
    removeCourseFromLibrary,
    removeSelectedCoursesFromLibrary,
    toggleCourseCompletion,
    toggleSelectedCoursesCompletion,
    updateCourse,
    searchCourseInSemesters,
    totalCredits,
    completedCredits,
    requirementCredits
  } = useSchedule();

  const handleNavigateToSemester = (semesterId: string) => {
    const semesterElement = document.querySelector(`[data-semester-id="${semesterId}"]`);
    if (sem