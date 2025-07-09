import * as React from 'react';
import { Semester, Course, ScheduleData } from '../types/schedule';
import { loadScheduleData, saveScheduleData } from '../services/scheduleApi';

const DSCT_COURSES: Course[] = [
  // Major Pre-requisite courses (DSCT & COSC shared)
  { id: '1', code: 'MATH1014', name: 'Calculus II', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '2', code: 'MATH1023', name: 'Honors Calculus I', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '3', code: 'COMP1022P', name: 'Introduction to Computing with Java', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  
  // Required Courses - DSCT only
  { id: '4', code: 'DSCT4900', name: 'Academic and Professional Development', credits: 0, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '5', code: 'MATH2023', name: 'Multivariable Calculus', credits: 4, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '7', code: 'MATH2411', name: 'Applied Statistics', credits: 4, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '8', code: 'MATH2421', name: 'Probability', credits: 4, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '9', code: 'MATH3322', name: 'Matrix Computation', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '10', code: 'MATH3332', name: 'Data Analytic Tools', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '11', code: 'MATH3423', name: 'Statistical Inference', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '12', code: 'MATH3424', name: 'Regression Analysis', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '13', code: 'MATH4432', name: 'Statistical Machine Learning', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '22', code: 'MATH4425', name: 'Introductory Time Series', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  
  // Shared Required Courses (DSCT & COSC)
  { id: '6', code: 'MATH2121', name: 'Linear Algebra', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '16', code: 'COMP2011', name: 'Programming with C++', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '17', code: 'COMP2012', name: 'Object-Oriented Programming and Data Structures', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '18', code: 'COMP2711', name: 'Discrete Mathematical Tools for Computer Science', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '19', code: 'COMP3711H', name: 'Honors Design and Analysis of Algorithms', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  
  // Shared Electives (DSCT & COSC)
  { id: '14', code: 'COMP5212', name: 'Machine Learning', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '15', code: 'COMP4981', name: 'Final Year Project', credits: 6, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '20', code: 'COMP2211', name: 'Exploring Artificial Intelligence', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '21', code: 'COMP4222', name: 'Machine Learning with Structured Data', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  
  // COSC-only Required Courses
  { id: '23', code: 'COMP2611', name: 'Computer Organization', credits: 4, majorRequirements: ['COSC'], isCompleted: false },
  { id: '24', code: 'COMP3111', name: 'Software Engineering', credits: 4, majorRequirements: ['COSC'], isCompleted: false },
  { id: '25', code: 'COMP3511', name: 'Operating Systems', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  { id: '26', code: 'COMP4900', name: 'Academic and Professional Development', credits: 0, majorRequirements: ['COSC'], isCompleted: false },
  { id: '27', code: 'ISOM2500', name: 'Business Statistics', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  
  // COSC-only Electives
  { id: '28', code: 'COMP3031', name: 'Principles of Programming Languages', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  { id: '29', code: 'COMP4211', name: 'Machine Learning', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  { id: '30', code: 'COMP4332', name: 'Big Data Mining and Management', credits: 3, majorRequirements: ['COSC'], isCompleted: false }
];

// Define the exact required semesters (Fall and Spring only)
const REQUIRED_SEMESTERS = [
  { year: 2024, type: 'Fall' as const, id: 'semester_2024_fall' },
  { year: 2025, type: 'Spring' as const, id: 'semester_2025_spring' },
  { year: 2025, type: 'Fall' as const, id: 'semester_2025_fall' },
  { year: 2026, type: 'Spring' as const, id: 'semester_2026_spring' },
  { year: 2026, type: 'Fall' as const, id: 'semester_2026_fall' },
  { year: 2027, type: 'Spring' as const, id: 'semester_2027_spring' },
  { year: 2027, type: 'Fall' as const, id: 'semester_2027_fall' },
  { year: 2028, type: 'Spring' as const, id: 'semester_2028_spring' }
];

// Function to sort semesters by academic year sequence
const sortSemesters = (semesters: Semester[]): Semester[] => {
  return [...semesters].sort((a, b) => {
    // Calculate academic year (Fall belongs to the academic year that starts)
    const getAcademicYear = (semester: Semester) => {
      if (semester.type === 'Fall') {
        return semester.year;
      } else {
        return semester.year - 1; // Spring belongs to previous academic year
      }
    };

    const academicYearA = getAcademicYear(a);
    const academicYearB = getAcademicYear(b);

    if (academicYearA !== academicYearB) {
      return academicYearA - academicYearB;
    }

    // Within the same academic year: Fall -> Spring
    const order = { 'Fall': 1, 'Spring': 2 };
    return order[a.type] - order[b.type];
  });
};

// Generate the required semesters ensuring they always exist
const ensureRequiredSemesters = (existingSemesters: Semester[]): Semester[] => {
  const existingSemesterMap = new Map(existingSemesters.map(s => [s.id, s]));
  const allSemesters: Semester[] = [...existingSemesters];

  REQUIRED_SEMESTERS.forEach(({ year, type, id }) => {
    if (!existingSemesterMap.has(id)) {
      // Add missing required semester
      allSemesters.push({
        id,
        name: `${type} ${year}`,
        type,
        year,
        courses: []
      });
    }
  });

  return sortSemesters(allSemesters);
};

export function useSchedule() {
  const [scheduleData, setScheduleData] = React.useState<ScheduleData>({
    semesters: [],
    availableCourses: [...DSCT_COURSES]
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [selectedCourses, setSelectedCourses] = React.useState<Set<string>>(new Set());

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading schedule data...');
        const data = await loadScheduleData();
        
        // Always ensure required semesters exist
        const requiredSemesters = ensureRequiredSemesters(data.semesters);
        
        setScheduleData({
          semesters: requiredSemesters,
          availableCourses: data.availableCourses.length > 0 ? data.availableCourses : [...DSCT_COURSES]
        });
        
        console.log('Schedule data loaded and required semesters ensured');
      } catch (error) {
        console.error('Failed to load schedule data, using defaults:', error);
        setScheduleData({
          semesters: ensureRequiredSemesters([]),
          availableCourses: [...DSCT_COURSES]
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-save function with debouncing
  const autoSave = React.useCallback((newData: ScheduleData) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        console.log('Auto-saving schedule data...');
        await saveScheduleData(newData);
        console.log('Auto-save completed successfully');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000); // Save 1 second after last change

    setSaveTimeout(timeout);
  }, [saveTimeout]);

  // Update data and trigger auto-save
  const updateScheduleData = React.useCallback((newData: ScheduleData) => {
    // Always ensure required semesters exist and sort all semesters
    const updatedData = {
      ...newData,
      semesters: ensureRequiredSemesters(newData.semesters)
    };
    
    setScheduleData(updatedData);
    if (!isLoading) {
      autoSave(updatedData);
    }
  }, [autoSave, isLoading]);

  // Multi-select functions
  const toggleCourseSelection = React.useCallback((courseId: string) => {
    setSelectedCourses(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(courseId)) {
        newSelected.delete(courseId);
      } else {
        newSelected.add(courseId);
      }
      return newSelected;
    });
  }, []);

  const selectCourse = React.useCallback((courseId: string) => {
    setSelectedCourses(prev => new Set(prev).add(courseId));
  }, []);

  const deselectCourse = React.useCallback((courseId: string) => {
    setSelectedCourses(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(courseId);
      return newSelected;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedCourses(new Set());
  }, []);

  const selectAllCourses = React.useCallback((courses: Course[]) => {
    setSelectedCourses(new Set(courses.map(c => c.id)));
  }, []);

  // Get selected courses from various locations
  const getSelectedCourses = React.useCallback(() => {
    const allCourses: Course[] = [...scheduleData.availableCourses];
    scheduleData.semesters.forEach(semester => {
      allCourses.push(...semester.courses);
    });
    
    return allCourses.filter(course => selectedCourses.has(course.id));
  }, [scheduleData, selectedCourses]);

  const addSemester = (type: 'Fall' | 'Winter' | 'Spring' | 'Summer', year: number) => {
    // Check if a semester with the same type and year already exists
    const existingSemester = scheduleData.semesters.find(s => s.type === type && s.year === year);
    if (existingSemester) {
      console.log('A semester with this type and year already exists');
      return;
    }

    const newSemester: Semester = {
      id: `semester_${year}_${type.toLowerCase()}_${Date.now()}`,
      name: `${type} ${year}`,
      type,
      year,
      courses: []
    };
    
    const newData = {
      ...scheduleData,
      semesters: sortSemesters([...scheduleData.semesters, newSemester])
    };
    
    updateScheduleData(newData);
  };

  const removeSemester = (semesterId: string) => {
    // Prevent removing required semesters
    const isRequired = REQUIRED_SEMESTERS.some(req => req.id === semesterId);
    if (isRequired) {
      console.log('Cannot remove required semester');
      return;
    }

    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (semester) {
      const newData = {
        semesters: scheduleData.semesters.filter(s => s.id !== semesterId),
        availableCourses: [...scheduleData.availableCourses, ...semester.courses]
      };
      updateScheduleData(newData);
    }
  };

  const clearSemesterCourses = (semesterId: string) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (semester) {
      const newData = {
        semesters: scheduleData.semesters.map(s =>
          s.id === semesterId ? { ...s, courses: [] } : s
        ),
        availableCourses: [...scheduleData.availableCourses, ...semester.courses]
      };
      updateScheduleData(newData);
    }
  };

  const addCourseToSemester = (semesterId: string, course: Course) => {
    const newData = {
      semesters: scheduleData.semesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, course] }
          : semester
      ),
      availableCourses: scheduleData.availableCourses.filter(c => c.id !== course.id)
    };
    updateScheduleData(newData);
  };

  const addSelectedCoursesToSemester = (semesterId: string) => {
    const coursesToAdd = getSelectedCourses().filter(course => 
      scheduleData.availableCourses.some(c => c.id === course.id)
    );
    
    if (coursesToAdd.length === 0) return;

    const newData = {
      semesters: scheduleData.semesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, ...coursesToAdd] }
          : semester
      ),
      availableCourses: scheduleData.availableCourses.filter(c => 
        !coursesToAdd.some(course => course.id === c.id)
      )
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const removeCourseFromSemester = (semesterId: string, courseId: string) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    const course = semester?.courses.find(c => c.id === courseId);
    
    if (course) {
      const newData = {
        semesters: scheduleData.semesters.map(s =>
          s.id === semesterId
            ? { ...s, courses: s.courses.filter(c => c.id !== courseId) }
            : s
        ),
        availableCourses: [...scheduleData.availableCourses, course]
      };
      updateScheduleData(newData);
    }
  };

  const removeSelectedCoursesFromSemester = (semesterId: string) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (!semester) return;

    const selectedInSemester = semester.courses.filter(course => 
      selectedCourses.has(course.id)
    );
    
    if (selectedInSemester.length === 0) return;

    const newData = {
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter(c => !selectedCourses.has(c.id)) }
          : s
      ),
      availableCourses: [...scheduleData.availableCourses, ...selectedInSemester]
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const moveCourse = (fromSemesterId: string, toSemesterId: string, courseId: string) => {
    if (fromSemesterId === toSemesterId) return;

    const fromSemester = scheduleData.semesters.find(s => s.id === fromSemesterId);
    const course = fromSemester?.courses.find(c => c.id === courseId);
    
    if (course) {
      const newData = {
        ...scheduleData,
        semesters: scheduleData.semesters.map(semester => {
          if (semester.id === fromSemesterId) {
            return { ...semester, courses: semester.courses.filter(c => c.id !== courseId) };
          }
          if (semester.id === toSemesterId) {
            return { ...semester, courses: [...semester.courses, course] };
          }
          return semester;
        })
      };
      updateScheduleData(newData);
    }
  };

  const moveSelectedCourses = (fromSemesterId: string, toSemesterId: string) => {
    if (fromSemesterId === toSemesterId) return;

    const fromSemester = scheduleData.semesters.find(s => s.id === fromSemesterId);
    const toSemester = scheduleData.semesters.find(s => s.id === toSemesterId);
    
    if (!fromSemester || !toSemester) return;

    const coursesToMove = fromSemester.courses.filter(course => 
      selectedCourses.has(course.id)
    );
    
    if (coursesToMove.length === 0) return;

    const newData = {
      ...scheduleData,
      semesters: scheduleData.semesters.map(semester => {
        if (semester.id === fromSemesterId) {
          return { ...semester, courses: semester.courses.filter(c => !selectedCourses.has(c.id)) };
        }
        if (semester.id === toSemesterId) {
          return { ...semester, courses: [...semester.courses, ...coursesToMove] };
        }
        return semester;
      })
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const addCourseToLibrary = (course: Course) => {
    const newData = {
      ...scheduleData,
      availableCourses: [...scheduleData.availableCourses, course]
    };
    updateScheduleData(newData);
  };

  const removeCourseFromLibrary = (courseId: string) => {
    const newData = {
      ...scheduleData,
      availableCourses: scheduleData.availableCourses.filter(c => c.id !== courseId)
    };
    updateScheduleData(newData);
  };

  const removeSelectedCoursesFromLibrary = () => {
    const newData = {
      ...scheduleData,
      availableCourses: scheduleData.availableCourses.filter(c => !selectedCourses.has(c.id))
    };
    updateScheduleData(newData);
    clearSelection();
  };

  const toggleCourseCompletion = (courseId: string) => {
    const newData = {
      semesters: scheduleData.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          course.id === courseId
            ? { ...course, isCompleted: !course.isCompleted }
            : course
        )
      })),
      availableCourses: scheduleData.availableCourses.map(course =>
        course.id === courseId
          ? { ...course, isCompleted: !course.isCompleted }
          : course
      )
    };
    updateScheduleData(newData);
  };

  const toggleSelectedCoursesCompletion = (completed: boolean) => {
    const newData = {
      semesters: scheduleData.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          selectedCourses.has(course.id)
            ? { ...course, isCompleted: completed }
            : course
        )
      })),
      availableCourses: scheduleData.availableCourses.map(course =>
        selectedCourses.has(course.id)
          ? { ...course, isCompleted: completed }
          : course
      )
    };
    updateScheduleData(newData);
    clearSelection();
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    const newData = {
      semesters: scheduleData.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          course.id === courseId ? { ...course, ...updates } : course
        )
      })),
      availableCourses: scheduleData.availableCourses.map(course =>
        course.id === courseId ? { ...course, ...updates } : course
      )
    };
    updateScheduleData(newData);
  };

  // Search for a course across all semesters (case-insensitive)
  const searchCourseInSemesters = (searchTerm: string): Array<{semester: Semester, course: Course}> => {
    if (!searchTerm.trim()) return [];
    
    const results: Array<{semester: Semester, course: Course}> = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    scheduleData.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (
          course.code.toLowerCase().includes(lowerSearchTerm) ||
          course.name.toLowerCase().includes(lowerSearchTerm)
        ) {
          results.push({ semester, course });
        }
      });
    });
    
    return results;
  };

  const totalCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses.reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const completedCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.isCompleted)
        .reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  // Calculate requirement credits (completed/total planned)
  const requirementCredits = React.useMemo(() => {
    const allScheduledCourses = scheduleData.semesters.flatMap(semester => semester.courses);
    
    const dsctCompleted = allScheduledCourses
      .filter(course => course.isCompleted && course.majorRequirements.includes('DSCT'))
      .reduce((sum, course) => sum + course.credits, 0);
    
    const dsctTotal = allScheduledCourses
      .filter(course => course.majorRequirements.includes('DSCT'))
      .reduce((sum, course) => sum + course.credits, 0);

    const coscCompleted = allScheduledCourses
      .filter(course => course.isCompleted && course.majorRequirements.includes('COSC'))
      .reduce((sum, course) => sum + course.credits, 0);
    
    const coscTotal = allScheduledCourses
      .filter(course => course.majorRequirements.includes('COSC'))
      .reduce((sum, course) => sum + course.credits, 0);

    const cccCompleted = allScheduledCourses
      .filter(course => course.isCompleted && course.majorRequirements.includes('CCC'))
      .reduce((sum, course) => sum + course.credits, 0);
    
    const cccTotal = allScheduledCourses
      .filter(course => course.majorRequirements.includes('CCC'))
      .reduce((sum, course) => sum + course.credits, 0);

    return {
      dsct: { completed: dsctCompleted, total: dsctTotal },
      cosc: { completed: coscCompleted, total: coscTotal },
      ccc: { completed: cccCompleted, total: cccTotal }
    };
  }, [scheduleData.semesters]);

  return {
    semesters: scheduleData.semesters,
    availableCourses: scheduleData.availableCourses,
    isLoading,
    selectedCourses,
    getSelectedCourses,
    toggleCourseSelection,
    selectCourse,
    deselectCourse,
    clearSelection,
    selectAllCourses,
    addSemester,
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
  };
}