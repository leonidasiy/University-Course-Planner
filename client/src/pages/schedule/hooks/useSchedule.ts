import * as React from 'react';
import { Semester, Course, ScheduleData } from '../types/schedule';

const SAMPLE_COURSES: Course[] = [
  { id: '1', code: 'CS101', name: 'Introduction to Computer Science', credits: 3, majorRequirement: 'COSC' },
  { id: '2', code: 'MATH151', name: 'Calculus I', credits: 4, majorRequirement: null },
  { id: '3', code: 'ENGL101', name: 'English Composition', credits: 3, majorRequirement: 'CCC' },
  { id: '4', code: 'HIST201', name: 'World History', credits: 3, majorRequirement: 'CCC' },
  { id: '5', code: 'CS201', name: 'Data Structures', credits: 3, majorRequirement: 'COSC' },
  { id: '6', code: 'MATH152', name: 'Calculus II', credits: 4, majorRequirement: null },
  { id: '7', code: 'PHYS101', name: 'Physics I', credits: 4, majorRequirement: 'CCC' },
  { id: '8', code: 'CS301', name: 'Algorithms', credits: 3, majorRequirement: 'COSC' },
  { id: '9', code: 'DSCT101', name: 'Introduction to Data Science', credits: 3, majorRequirement: 'DSCT' },
  { id: '10', code: 'DSCT201', name: 'Statistical Computing', credits: 3, majorRequirement: 'DSCT' },
  { id: '11', code: 'DSCT301', name: 'Machine Learning', credits: 3, majorRequirement: 'DSCT' },
  { id: '12', code: 'STAT101', name: 'Statistics I', credits: 3, majorRequirement: 'DSCT' },
  { id: '13', code: 'PHIL101', name: 'Introduction to Philosophy', credits: 3, majorRequirement: 'CCC' },
  { id: '14', code: 'PSYC101', name: 'General Psychology', credits: 3, majorRequirement: 'CCC' },
  { id: '15', code: 'ECON101', name: 'Principles of Economics', credits: 3, majorRequirement: 'CCC' },
  { id: '16', code: 'BIOL101', name: 'General Biology', credits: 4, majorRequirement: 'CCC' },
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

  const totalCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses.reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const completedCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses.reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const dsctCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.majorRequirement === 'DSCT')
        .reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const coscCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.majorRequirement === 'COSC')
        .reduce((semTotal, course) => semTotal + course.credits, 0), 0
    );
  }, [scheduleData.semesters]);

  const cccCredits = React.useMemo(() => {
    return scheduleData.semesters.reduce((total, semester) => 
      total + semester.courses
        .filter(course => course.majorRequirement === 'CCC')
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
    totalCredits,
    completedCredits,
    dsctCredits,
    coscCredits,
    cccCredits
  };
}