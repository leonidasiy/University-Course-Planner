import * as React from 'react';
import { Semester, Course, ScheduleData } from '../types/schedule';
import { loadScheduleData, saveScheduleData } from '../services/scheduleApi';

const DSCT_COURSES: Course[] = [
  // Major Pre-requisite courses (DSCT & COSC shared)
  { id: '1', code: 'MATH1014', name: 'Calculus II', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Prerequisites' },
  { id: '2', code: 'MATH1023', name: 'Honors Calculus I', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Prerequisites' },
  { id: '3', code: 'COMP1022P', name: 'Introduction to Computing with Java', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Prerequisites' },
  
  // Required Courses - DSCT only
  { id: '4', code: 'DSCT4900', name: 'Academic and Professional Development', credits: 0, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '5', code: 'MATH2023', name: 'Multivariable Calculus', credits: 4, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '7', code: 'MATH2411', name: 'Applied Statistics', credits: 4, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '8', code: 'MATH2421', name: 'Probability', credits: 4, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '9', code: 'MATH3322', name: 'Matrix Computation', credits: 3, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '10', code: 'MATH3332', name: 'Data Analytic Tools', credits: 3, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '11', code: 'MATH3423', name: 'Statistical Inference', credits: 3, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '12', code: 'MATH3424', name: 'Regression Analysis', credits: 3, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '13', code: 'MATH4432', name: 'Statistical Machine Learning', credits: 3, majorRequirements: ['DSCT'], isCompleted: false, category: 'Major Requirements' },
  { id: '22', code: 'MATH4425', name: 'Introductory Time Series', credits: 3, majorRequirements: ['DSCT'], isCompleted: false, category: 'Electives' },
  
  // Shared Required Courses (DSCT & COSC)
  { id: '6', code: 'MATH2121', name: 'Linear Algebra', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '16', code: 'COMP2011', name: 'Programming with C++', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '17', code: 'COMP2012', name: 'Object-Oriented Programming and Data Structures', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '18', code: 'COMP2711', name: 'Discrete Mathematical Tools for Computer Science', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '19', code: 'COMP3711H', name: 'Honors Design and Analysis of Algorithms', credits: 4, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Major Requirements' },
  
  // Shared Electives (DSCT & COSC)
  { id: '14', code: 'COMP5212', name: 'Machine Learning', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Electives' },
  { id: '15', code: 'COMP4981', name: 'Final Year Project', credits: 6, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '20', code: 'COMP2211', name: 'Exploring Artificial Intelligence', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Electives' },
  { id: '21', code: 'COMP4222', name: 'Machine Learning with Structured Data', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false, category: 'Electives' },
  
  // COSC-only Required Courses
  { id: '23', code: 'COMP2611', name: 'Computer Organization', credits: 4, majorRequirements: ['COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '24', code: 'COMP3111', name: 'Software Engineering', credits: 4, majorRequirements: ['COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '25', code: 'COMP3511', name: 'Operating Systems', credits: 3, majorRequirements: ['COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '26', code: 'COMP4900', name: 'Academic and Professional Development', credits: 0, majorRequirements: ['COSC'], isCompleted: false, category: 'Major Requirements' },
  { id: '27', code: 'ISOM2500', name: 'Business Statistics', credits: 3, majorRequirements: ['COSC'], isCompleted: false, category: 'Major Requirements' },
  
  // COSC-only Electives
  { id: '28', code: 'COMP3031', name: 'Principles of Programming Languages', credits: 3, majorRequirements: ['COSC'], isCompleted: false, category: 'Electives' },
  { id: '29', code: 'COMP4211', name: 'Machine Learning', credits: 3, majorRequirements: ['COSC'], isCompleted: false, category: 'Electives' },
  { id: '30', code: 'COMP4332', name: 'Big Data Mining and Management', credits: 3, majorRequirements: ['COSC'], isCompleted: false, category: 'Electives' },

  // Common Core Courses
  { id: '31', code: 'LANG1002', name: 'English for University Studies', credits: 3, majorRequirements: ['CCC'], isCompleted: false, category: 'Prerequisites' },
  { id: '32', code: 'LANG1003', name: 'English Communication', credits: 3, majorRequirements: ['CCC'], isCompleted: false, category: 'Prerequisites' },
  { id: '33', code: 'SOSC1440', name: 'Introduction to Economics', credits: 3, majorRequirements: ['CCC'], isCompleted: false, category: 'Major Requirements' },
  { id: '34', code: 'HUMA1000', name: 'Cultures and Values', credits: 3, majorRequirements: ['CCC'], isCompleted: false, category: 'Major Requirements' },
  { id: '35', code: 'HUMA1440', name: 'Introduction to Psychology', credits: 3, majorRequirements: ['CCC'], isCompleted: false, category: 'Electives' }
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
    const order = { 'Fall': 1, 'Spring': 2, 'Winter': 3, 'Summer': 4 };
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
        
        // Migrate courses to include category if missing
        const migratedAvailableCourses = data.availableCourses.map(course => ({
          ...course,
          category: course.category || 'Major Requirements'
        })) as Course[];

        const migratedSemesters = data.semesters.map(semester => ({
          ...semester,
          courses: semester.courses.map(course => ({
            ...course,
            category: course.category || 'Major Requirements'
          })) as Course[]
        }));
        
        // Always ensure required semesters exist
        const requiredSemesters = ensureRequiredSemesters(migratedSemesters);
        
        setScheduleData({
          semesters: requiredSemesters,
          availableCourses: migratedAvailableCourses.length > 0 ? migratedAvailableCourses : [...DSCT_COURSES]
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

  // Helper function to find which semester a course is in
  const findCourseInSemesters = React.useCallback((courseId: string) => {
    for (const semester of scheduleData.semesters) {
      if (semester.courses.some(c => c.id === courseId)) {
        return semester;
      }
    }
    return null;
  }, [scheduleData.semesters]);

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
      semester.courses.forEach(course => {
        // Avoid duplicates since availableCourses now contains all courses
        if (!allCourses.find(c => c.id === course.id)) {
          allCourses.push(course);
        }
      });
    });
    
    return allCourses.filter(course => selectedCourses.has(course.id));
  }, [scheduleData, selectedCourses]);

  const updateCourse = React.useCallback((courseId: string, updates: Partial<Course>) => {
    console.log('Updating course:', courseId, 'with updates:', updates);
    
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
  }, [scheduleData, updateScheduleData]);

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

  const updateSemesterName = (semesterId: string, newName: string) => {
    const newData = {
      ...scheduleData,
      semesters: scheduleData.semesters.map(semester =>
        semester.id === semesterId 
          ? { ...semester, name: newName }
          : semester
      )
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
        availableCourses: scheduleData.availableCourses // Keep all courses in library
      };
      updateScheduleData(newData);
    }
  };

  const clearSemesterCourses = (semesterId: string) => {
    const newData = {
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId ? { ...s, courses: [] } : s
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    updateScheduleData(newData);
  };

  const addCourseToSemester = (semesterId: string, course: Course) => {
    // Check if course is already in this semester
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (semester && semester.courses.some(c => c.id === course.id)) {
      console.log('Course already in this semester');
      return;
    }

    const newData = {
      semesters: scheduleData.semesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, course] }
          : semester
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    updateScheduleData(newData);
  };

  const insertCourseAtPosition = (semesterId: string, course: Course, position: number) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (!semester) return;

    // Check if course is already in this semester
    if (semester.courses.some(c => c.id === course.id)) {
      console.log('Course already in this semester');
      return;
    }

    const newCourses = [...semester.courses];
    newCourses.splice(position, 0, course);

    const newData = {
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId ? { ...s, courses: newCourses } : s
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    updateScheduleData(newData);
  };

  const addSelectedCoursesToSemester = (semesterId: string) => {
    const coursesToAdd = getSelectedCourses().filter(course => {
      const semester = scheduleData.semesters.find(s => s.id === semesterId);
      return semester && !semester.courses.some(c => c.id === course.id);
    });
    
    if (coursesToAdd.length === 0) return;

    const newData = {
      semesters: scheduleData.semesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, ...coursesToAdd] }
          : semester
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const insertSelectedCoursesAtPosition = (semesterId: string, position: number) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (!semester) return;

    const coursesToAdd = getSelectedCourses().filter(course => 
      !semester.courses.some(c => c.id === course.id)
    );
    
    if (coursesToAdd.length === 0) return;

    const newCourses = [...semester.courses];
    newCourses.splice(position, 0, ...coursesToAdd);

    const newData = {
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId ? { ...s, courses: newCourses } : s
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const removeCourseFromSemester = (semesterId: string, courseId: string) => {
    const newData = {
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter(c => c.id !== courseId) }
          : s
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    updateScheduleData(newData);
  };

  const removeSelectedCoursesFromSemester = (semesterId: string) => {
    const newData = {
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter(c => !selectedCourses.has(c.id)) }
          : s
      ),
      availableCourses: scheduleData.availableCourses // Keep all courses in library
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const moveCourse = (fromSemesterId: string, toSemesterId: string, courseId: string) => {
    if (fromSemesterId === toSemesterId) return;

    const fromSemester = scheduleData.semesters.find(s => s.id === fromSemesterId);
    const toSemester = scheduleData.semesters.find(s => s.id === toSemesterId);
    const course = fromSemester?.courses.find(c => c.id === courseId);
    
    if (course && toSemester && !toSemester.courses.some(c => c.id === courseId)) {
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

  const moveCourseToPosition = (fromSemesterId: string, toSemesterId: string, courseId: string, position: number) => {
    if (fromSemesterId === toSemesterId) return;

    const fromSemester = scheduleData.semesters.find(s => s.id === fromSemesterId);
    const toSemester = scheduleData.semesters.find(s => s.id === toSemesterId);
    const course = fromSemester?.courses.find(c => c.id === courseId);
    
    if (course && toSemester && !toSemester.courses.some(c => c.id === courseId)) {
      const newToCourses = [...toSemester.courses];
      newToCourses.splice(position, 0, course);

      const newData = {
        ...scheduleData,
        semesters: scheduleData.semesters.map(semester => {
          if (semester.id === fromSemesterId) {
            return { ...semester, courses: semester.courses.filter(c => c.id !== courseId) };
          }
          if (semester.id === toSemesterId) {
            return { ...semester, courses: newToCourses };
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
      selectedCourses.has(course.id) && !toSemester.courses.some(c => c.id === course.id)
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

  const moveSelectedCoursesToPosition = (fromSemesterId: string, toSemesterId: string, position: number) => {
    if (fromSemesterId === toSemesterId) return;

    const fromSemester = scheduleData.semesters.find(s => s.id === fromSemesterId);
    const toSemester = scheduleData.semesters.find(s => s.id === toSemesterId);
    
    if (!fromSemester || !toSemester) return;

    const coursesToMove = fromSemester.courses.filter(course => 
      selectedCourses.has(course.id) && !toSemester.courses.some(c => c.id === course.id)
    );
    
    if (coursesToMove.length === 0) return;

    const newToCourses = [...toSemester.courses];
    newToCourses.splice(position, 0, ...coursesToMove);

    const newData = {
      ...scheduleData,
      semesters: scheduleData.semesters.map(semester => {
        if (semester.id === fromSemesterId) {
          return { ...semester, courses: semester.courses.filter(c => !selectedCourses.has(c.id)) };
        }
        if (semester.id === toSemesterId) {
          return { ...semester, courses: newToCourses };
        }
        return semester;
      })
    };
    
    updateScheduleData(newData);
    clearSelection();
  };

  const reorderCoursesInSemester = (semesterId: string, dragIndex: number, dropIndex: number) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (!semester || dragIndex === dropIndex) return;

    const reorderedCourses = [...semester.courses];
    const [draggedCourse] = reorderedCourses.splice(dragIndex, 1);
    reorderedCourses.splice(dropIndex, 0, draggedCourse);

    const newData = {
      ...scheduleData,
      semesters: scheduleData.semesters.map(s =>
        s.id === semesterId ? { ...s, courses: reorderedCourses } : s
      )
    };
    
    updateScheduleData(newData);
  };

  const addCourseToLibrary = (course: Course) => {
    const newData = {
      ...scheduleData,
      availableCourses: [...scheduleData.availableCourses, course]
    };
    updateScheduleData(newData);
  };

  const removeCourseFromLibrary = (courseId: string) => {
    // Remove course from both library and all semesters
    const newData = {
      semesters: scheduleData.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.filter(c => c.id !== courseId)
      })),
      availableCourses: scheduleData.availableCourses.filter(c => c.id !== courseId)
    };
    updateScheduleData(newData);
  };

  const removeSelectedCoursesFromLibrary = () => {
    // Remove courses from both library and all semesters
    const newData = {
      semesters: scheduleData.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.filter(c => !selectedCourses.has(c.id))
      })),
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
          course.id === courseId ? { ...course, isCompleted: !course.isCompleted } : course
        )
      })),
      availableCourses: scheduleData.availableCourses.map(course =>
        course.id === courseId ? { ...course, isCompleted: !course.isCompleted } : course
      )
    };
    updateScheduleData(newData);
  };

  const toggleSelectedCoursesCompletion = (completed: boolean) => {
    const newData = {
      semesters: scheduleData.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          selectedCourses.has(course.id) ? { ...course, isCompleted: completed } : course
        )
      })),
      availableCourses: scheduleData.availableCourses.map(course =>
        selectedCourses.has(course.id) ? { ...course, isCompleted: completed } : course
      )
    };
    updateScheduleData(newData);
  };

  const searchCourseInSemesters = (searchTerm: string) => {
    const results: Array<{semester: Semester, course: Course}> = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    scheduleData.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (course.code.toLowerCase().includes(lowerSearchTerm) ||
            course.name.toLowerCase().includes(lowerSearchTerm)) {
          results.push({ semester, course });
        }
      });
    });
    
    return results;
  };

  // Calculate totals and requirement credits dynamically based on available majors
  const totalCredits = React.useMemo(() => {
    const allCourses = [...scheduleData.availableCourses];
    scheduleData.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (!allCourses.find(c => c.id === course.id)) {
          allCourses.push(course);
        }
      });
    });
    
    return allCourses.reduce((sum, course) => sum + course.credits, 0);
  }, [scheduleData]);

  const completedCredits = React.useMemo(() => {
    const allCourses = [...scheduleData.availableCourses];
    scheduleData.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (!allCourses.find(c => c.id === course.id)) {
          allCourses.push(course);
        }
      });
    });
    
    return allCourses
      .filter(course => course.isCompleted)
      .reduce((sum, course) => sum + course.credits, 0);
  }, [scheduleData]);

  // This function now returns a dynamic object based on available courses
  // The actual major requirement calculation will be done in the component level
  // where the majors data is available
  const requirementCredits = React.useMemo(() => {
    const allCourses = [...scheduleData.availableCourses];
    scheduleData.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (!allCourses.find(c => c.id === course.id)) {
          allCourses.push(course);
        }
      });
    });

    // Create a fallback for the default majors
    const defaultRequirements = ['DSCT', 'COSC', 'CCC'];
    const result: { [key: string]: { completed: number; total: number } } = {};

    defaultRequirements.forEach(req => {
      const reqCourses = allCourses.filter(course => 
        course.majorRequirements.includes(req)
      );
      
      result[req] = {
        completed: reqCourses
          .filter(course => course.isCompleted)
          .reduce((sum, course) => sum + course.credits, 0),
        total: reqCourses.reduce((sum, course) => sum + course.credits, 0)
      };
    });

    return result;
  }, [scheduleData]);

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
    requirementCredits
  };
}