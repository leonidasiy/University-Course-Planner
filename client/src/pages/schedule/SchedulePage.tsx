import * as React from 'react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { SemesterList } from './components/SemesterList';
import { CourseLibrary } from './components/CourseLibrary';
import { CourseSearch } from './components/CourseSearch';
import { SemesterQuickNav } from './components/SemesterQuickNav';
import { useSchedule } from './hooks/useSchedule';
import { useMajorSettings } from './hooks/useMajorSettings';

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
    insertCourseAtPosition,
    addSelectedCoursesToSemester,
    insertSelectedCoursesAtPosition,
    removeCourseFromSemester,
    removeSelectedCoursesFromSemester,
    moveCourse,
    moveCourseToPosition,
    moveSelectedCourses,
    moveSelectedCoursesToPosition,
    reorderCoursesInSemester,
    addCourseToLibrary,
    removeCourseFromLibrary,
    removeSelectedCoursesFromLibrary,
    toggleCourseCompletion,
    toggleSelectedCoursesCompletion,
    updateCourse,
    searchCourseInSemesters,
    findCourseInSemesters,
    totalCredits,
    completedCredits,
    requirementCredits: basicRequirementCredits
  } = useSchedule();

  const {
    majors,
    isLoading: majorSettingsLoading,
    updateMajor,
    addMajor,
    removeMajor,
    reorderMajors,
    getMajorColor,
    getMajorName
  } = useMajorSettings();

  // Calculate requirement credits dynamically based on current majors
  const requirementCredits = React.useMemo(() => {
    const allCourses = [...availableCourses];
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (!allCourses.find(c => c.id === course.id)) {
          allCourses.push(course);
        }
      });
    });

    const result: { [key: string]: { completed: number; total: number } } = {};

    majors.forEach(major => {
      const majorCourses = allCourses.filter(course => 
        course.majorRequirements.includes(major.id as any)
      );
      
      result[major.id] = {
        completed: majorCourses
          .filter(course => course.isCompleted)
          .reduce((sum, course) => sum + course.credits, 0),
        total: majorCourses.reduce((sum, course) => sum + course.credits, 0)
      };
    });

    return result;
  }, [availableCourses, semesters, majors]);

  const handleNavigateToSemester = (semesterId: string) => {
    const semesterElement = document.querySelector(`[data-semester-id="${semesterId}"]`);
    if (semesterElement) {
      semesterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add a brief highlight effect
      const card = semesterElement.querySelector('.border-l-4');
      if (card) {
        card.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          card.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }
  };

  const handleCourseSelect = (courseId: string, isSelected: boolean) => {
    if (isSelected) {
      selectCourse(courseId);
    } else {
      deselectCourse(courseId);
    }
  };

  // Add keyboard event listener for global shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'a') {
          e.preventDefault();
          selectAllCourses([...availableCourses, ...semesters.flatMap(s => s.courses)]);
        } else if (e.key === 'd') {
          e.preventDefault();
          clearSelection();
        }
      }
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [availableCourses, semesters, selectAllCourses, clearSelection]);

  if (isLoading || majorSettingsLoading) {
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
    <>
      <div className="container mx-auto px-4 py-8">
        <ScheduleHeader
          totalCredits={totalCredits}
          completedCredits={completedCredits}
          requirementCredits={requirementCredits}
          majors={majors}
          onAddSemester={addSemester}
          onUpdateMajor={updateMajor}
          onAddMajor={addMajor}
          onRemoveMajor={removeMajor}
          onReorderMajors={reorderMajors}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <SemesterList
              semesters={semesters}
              availableCourses={availableCourses}
              selectedCourses={selectedCourses}
              majors={majors}
              onSelect={handleCourseSelect}
              onSelectAll={selectAllCourses}
              onClearSelection={clearSelection}
              onRemoveSemester={removeSemester}
              onClearSemesterCourses={clearSemesterCourses}
              onAddCourse={addCourseToSemester}
              onInsertCourseAtPosition={insertCourseAtPosition}
              onAddSelectedCourses={addSelectedCoursesToSemester}
              onInsertSelectedCoursesAtPosition={insertSelectedCoursesAtPosition}
              onRemoveCourse={removeCourseFromSemester}
              onRemoveSelectedCourses={removeSelectedCoursesFromSemester}
              onMoveCourse={moveCourse}
              onMoveCourseToPosition={moveCourseToPosition}
              onMoveSelectedCourses={moveSelectedCourses}
              onMoveSelectedCoursesToPosition={moveSelectedCoursesToPosition}
              onReorderCourses={reorderCoursesInSemester}
              onToggleCompletion={toggleCourseCompletion}
              onToggleSelectedCompletion={toggleSelectedCoursesCompletion}
              onUpdateSemesterName={updateSemesterName}
              onUpdateCourse={updateCourse}
            />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <CourseSearch 
              onSearch={searchCourseInSemesters}
              onNavigateToSemester={handleNavigateToSemester}
              majors={majors}
            />
            
            <CourseLibrary
              courses={availableCourses}
              semesters={semesters}
              selectedCourses={selectedCourses}
              majors={majors}
              onSelect={handleCourseSelect}
              onSelectAll={selectAllCourses}
              onClearSelection={clearSelection}
              onAddCourse={addCourseToLibrary}
              onRemoveCourse={removeCourseFromLibrary}
              onRemoveSelected={removeSelectedCoursesFromLibrary}
              onToggleCompletion={toggleCourseCompletion}
              onToggleSelectedCompletion={toggleSelectedCoursesCompletion}
              onUpdateCourse={updateCourse}
              findCourseInSemesters={findCourseInSemesters}
            />
            
            {selectedCourses.size > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} selected
                </p>
                <p className="mt-1">
                  Keyboard shortcuts: Ctrl+A (select all), Ctrl+D (deselect all), Esc (clear selection)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SemesterQuickNav
        semesters={semesters}
        onNavigateToSemester={handleNavigateToSemester}
      />
    </>
  );
}