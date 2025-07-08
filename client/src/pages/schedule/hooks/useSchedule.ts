import * as React from 'react';
import { Semester, Course, ScheduleData } from '../types/schedule';
import { loadScheduleData, saveScheduleData } from '../services/scheduleApi';

const SAMPLE_COURSES: Course[] = [
  { id: '1', code: 'CS101', name: 'Introduction to Computer Science', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  { id: '2', code: 'MATH151', name: 'Calculus I', credits: 4, majorRequirements: [], isCompleted: false },
  { id: '3', code: 'ENGL101', name: 'English Composition', credits: 3, majorRequirements: ['CCC'], isCompleted: false },
  { id: '4', code: 'HIST201', name: 'World History', credits: 3, majorRequirements: ['CCC'], isCompleted: false },
  { id: '5', code: 'CS201', name: 'Data Structures', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  { id: '6', code: 'MATH152', name: 'Calculus II', credits: 4, majorRequirements: [], isCompleted: false },
  { id: '7', code: 'PHYS101', name: 'Physics I', credits: 4, majorRequirements: ['CCC'], isCompleted: false },
  { id: '8', code: 'CS301', name: 'Algorithms', credits: 3, majorRequirements: ['COSC'], isCompleted: false },
  { id: '9', code: 'DSCT101', name: 'Introduction to Data Science', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '10', code: 'DSCT201', name: 'Statistical Computing', credits: 3, majorRequirements: ['DSCT', 'COSC'], isCompleted: false },
  { id: '11', code: 'DSCT301', name: 'Machine Learning', credits: 3, majorRequirements: ['DSCT'], isCompleted: false },
  { id: '12', code: 'STAT101', name: 'Statistics I', credits: 3, majorRequirements: ['DSCT', 'CCC'], isCompleted: false },
  { id: '13', code: 'PHIL101', name: 'Introduction to Philosophy', credits: 3, majorRequirements: ['CCC'], isCompleted: false },
  { id: '14', code: 'PSYC101', name: 'General Psychology', credits: 3, majorRequirements: ['CCC'], isCompleted: false },
  { id: '15', code: 'ECON101', name: 'Principles of Economics', credits: 3, majorRequirements: ['CCC'], isCompleted: false },
  { id: '16', code: 'BIOL101', name: 'General Biology', credits: 4, majorRequirements: ['CCC'], isCompleted: false },
  { id: '17', code: 'CS205', name: 'Database Systems', credits: 3, majorRequirements: ['COSC', 'DSCT'], isCompleted: false },
  { id: '18', code: 'MATH301', name: 'Linear Algebra', credits: 3, majorRequirements: ['DSCT', 'CCC'], isCompleted: false },
];

// Define the exact required semesters
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

// Function to sort semesters chronologically
const sortSemesters = (semesters: Semester[]): Semester[] => {
  return [...semesters].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const order = { 'Winter': 1, 'Spring': 2, 'Summer': 3, 'Fall': 4 };
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
    availableCourses: [...SAMPLE_COURSES]
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);

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
          availableCourses: data.availableCourses.length > 0 ? data.availableCourses : [...SAMPLE_COURSES]
        });
        
        console.log('Schedule data loaded and required semesters ensured');
      } catch (error) {
        console.error('Failed to load schedule data, using defaults:', error);
        setScheduleData({
          semesters: ensureRequiredSemesters([]),
          availableCourses: [...SAMPLE_COURSES]
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
    addSemester,
    removeSemester,
    clearSemesterCourses,
    addCourseToSemester,
    removeCourseFromSemester,
    moveCourse,
    addCourseToLibrary,
    removeCourseFromLibrary,
    toggleCourseCompletion,
    updateCourse,
    searchCourseInSemesters,
    totalCredits,
    completedCredits,
    requirementCredits
  };
}