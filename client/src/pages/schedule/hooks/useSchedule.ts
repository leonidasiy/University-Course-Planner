import * as React from 'react';
import { Semester, Course, ScheduleData } from '../types/schedule';

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

  const addSemester = (type: 'Fall' | 'Winter' | 'Spring' | 'Summer', year: number) => {
    const newSemester: Semester = {
      id: Date.now().toString(),
      name: `${type} ${year}`,
      type,
      year,
      courses: []
    };
    
    setScheduleData(prev => ({
      ...prev,
      semesters: [...prev.semesters, newSemester].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const order = { 'Winter': 1, 'Spring': 2, 'Summer': 3, 'Fall': 4 };
        return order[a.type] - order[b.type];
      })
    }));
  };

  const removeSemester = (semesterId: string) => {
    setScheduleData(prev => {
      const semester = prev.semesters.find(s => s.id === semesterId);
      if (semester) {
        return {
          semesters: prev.semesters.filter(s => s.id !== semesterId),
          availableCourses: [...prev.availableCourses, ...semester.courses]
        };
      }
      return prev;
    });
  };

  const addCourseToSemester = (semesterId: string, course: Course) => {
    setScheduleData(prev => ({
      semesters: prev.semesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, course] }
          : semester
      ),
      availableCourses: prev.availableCourses.filter(c => c.id !== course.id)
    }));
  };

  const removeCourseFromSemester = (semesterId: string, courseId: string) => {
    setScheduleData(prev => {
      const semester = prev.semesters.find(s => s.id === semesterId);
      const course = semester?.courses.find(c => c.id === courseId);
      
      if (course) {
        return {
          semesters: prev.semesters.map(s =>
            s.id === semesterId
              ? { ...s, courses: s.courses.filter(c => c.id !== courseId) }
              : s
          ),
          availableCourses: [...prev.availableCourses, course]
        };
      }
      return prev;
    });
  };

  const moveCourse = (fromSemesterId: string, toSemesterId: string, courseId: string) => {
    if (fromSemesterId === toSemesterId) return;

    setScheduleData(prev => {
      const fromSemester = prev.semesters.find(s => s.id === fromSemesterId);
      const course = fromSemester?.courses.find(c => c.id === courseId);
      
      if (course) {
        return {
          ...prev,
          semesters: prev.semesters.map(semester => {
            if (semester.id === fromSemesterId) {
              return { ...semester, courses: semester.courses.filter(c => c.id !== courseId) };
            }
            if (semester.id === toSemesterId) {
              return { ...semester, courses: [...semester.courses, course] };
            }
            return semester;
          })
        };
      }
      return prev;
    });
  };

  const addCourseToLibrary = (course: Course) => {
    setScheduleData(prev => ({
      ...prev,
      availableCourses: [...prev.availableCourses, course]
    }));
  };

  const removeCourseFromLibrary = (courseId: string) => {
    setScheduleData(prev => ({
      ...prev,
      availableCourses: prev.availableCourses.filter(c => c.id !== courseId)
    }));
  };

  const toggleCourseCompletion = (courseId: string) => {
    setScheduleData(prev => ({
      semesters: prev.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          course.id === courseId
            ? { ...course, isCompleted: !course.isCompleted }
            : course
        )
      })),
      availableCourses: prev.availableCourses.map(course =>
        course.id === courseId
          ? { ...course, isCompleted: !course.isCompleted }
          : course
      )
    }));
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setScheduleData(prev => ({
      semesters: prev.semesters.map(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          course.id === courseId ? { ...course, ...updates } : course
        )
      })),
      availableCourses: prev.availableCourses.map(course =>
        course.id === courseId ? { ...course, ...updates } : course
      )
    }));
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