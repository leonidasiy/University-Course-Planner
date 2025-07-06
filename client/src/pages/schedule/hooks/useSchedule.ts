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
        
        // If no data exists in database, use sample courses
        if (data.availableCourses.length === 0 && data.semesters.length === 0) {
          console.log('No existing data found, using sample courses');
          setScheduleData({
            semesters: [],
            availableCourses: [...SAMPLE_COURSES]
          });
        } else {
          console.log('Loaded existing data from database');
          setScheduleData(data);
        }
      } catch (error) {
        console.error('Failed to load schedule data, using sample data:', error);
        setScheduleData({
          semesters: [],
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
    setScheduleData(newData);
    if (!isLoading) {
      autoSave(newData);
    }
  }, [autoSave, isLoading]);

  const addSemester = (type: 'Fall' | 'Winter' | 'Spring' | 'Summer', year: number) => {
    const newSemester: Semester = {
      id: Date.now().toString(),
      name: `${type} ${year}`,
      type,
      year,
      courses: []
    };
    
    const newData = {
      ...scheduleData,
      semesters: [...scheduleData.semesters, newSemester].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const order = { 'Winter': 1, 'Spring': 2, 'Summer': 3, 'Fall': 4 };
        return order[a.type] - order[b.type];
      })
    };
    
    updateScheduleData(newData);
  };

  const removeSemester = (semesterId: string) => {
    const semester = scheduleData.semesters.find(s => s.id === semesterId);
    if (semester) {
      const newData = {
        semesters: scheduleData.semesters.filter(s => s.id !== semesterId),
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

  const dsctCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.isCompleted && course.majorRequirements.includes('DSCT'))
        .reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const coscCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.isCompleted && course.majorRequirements.includes('COSC'))
        .reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const cccCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.isCompleted && course.majorRequirements.includes('CCC'))
        .reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  return {
    semesters: scheduleData.semesters,
    availableCourses: scheduleData.availableCourses,
    isLoading,
    addSemester,
    removeSemester,
    addCourseToSemester,
    removeCourseFromSemester,
    moveCourse,
    addCourseToLibrary,
    removeCourseFromLibrary,
    toggleCourseCompletion,
    updateCourse,
    totalCredits,
    completedCredits,
    dsctCredits,
    coscCredits,
    cccCredits
  };
}