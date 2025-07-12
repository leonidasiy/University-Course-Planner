import express from 'express';
import { db } from '../database/connection.js';

const router = express.Router();

// Get all schedule data
router.get('/data', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Fetching schedule data...');
    
    // Get all courses
    const coursesFromDb = await db.selectFrom('courses').selectAll().execute();
    console.log(`Found ${coursesFromDb.length} courses`);
    
    // Get all semesters
    const semestersFromDb = await db.selectFrom('semesters').selectAll().execute();
    console.log(`Found ${semestersFromDb.length} semesters`);
    
    // Get semester-course relationships with ordering
    const semesterCourses = await db
      .selectFrom('semester_courses')
      .selectAll()
      .orderBy('order_index', 'asc')
      .execute();
    console.log(`Found ${semesterCourses.length} semester-course relationships`);
    
    // Transform database data to frontend format
    const courses = coursesFromDb.map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      majorRequirements: JSON.parse(course.major_requirements),
      isCompleted: Boolean(course.is_completed),
      category: course.category || 'Major Requirements'
    }));
    
    const semesters = semestersFromDb.map(semester => {
      // Get semester courses ordered by order_index
      const semesterCourseRelations = semesterCourses
        .filter(sc => sc.semester_id === semester.id)
        .sort((a, b) => a.order_index - b.order_index);
      
      const semesterCourseList = semesterCourseRelations
        .map(relation => courses.find(course => course.id === relation.course_id))
        .filter(course => course !== undefined);
      
      return {
        id: semester.id,
        name: semester.name,
        type: semester.type,
        year: semester.year,
        courses: semesterCourseList
      };
    });
    
    // Available courses should include ALL courses from the database
    // This allows the Course Library to show all courses with proper filtering
    const availableCourses = courses;
    
    console.log(`Returning ${semesters.length} semesters and ${availableCourses.length} available courses`);
    
    res.json({
      semesters,
      availableCourses
    });
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    res.status(500).json({ error: 'Failed to fetch schedule data' });
  }
});

// Save complete schedule data
router.post('/data', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Saving schedule data...');
    const { semesters, availableCourses } = req.body;
    
    // Start transaction
    await db.transaction().execute(async (trx) => {
      // Clear existing data
      await trx.deleteFrom('semester_courses').execute();
      await trx.deleteFrom('semesters').execute();
      await trx.deleteFrom('courses').execute();
      
      // Insert all courses (from semesters and available courses)
      const allCourses = [...availableCourses];
      semesters.forEach(semester => {
        semester.courses.forEach(course => {
          if (!allCourses.find(c => c.id === course.id)) {
            allCourses.push(course);
          }
        });
      });
      
      console.log(`Inserting ${allCourses.length} courses`);
      for (const course of allCourses) {
        await trx
          .insertInto('courses')
          .values({
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
            major_requirements: JSON.stringify(course.majorRequirements),
            is_completed: course.isCompleted ? 1 : 0,
            category: course.category || 'Major Requirements',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .execute();
      }
      
      // Insert semesters
      console.log(`Inserting ${semesters.length} semesters`);
      for (const semester of semesters) {
        await trx
          .insertInto('semesters')
          .values({
            id: semester.id,
            name: semester.name,
            type: semester.type,
            year: semester.year,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .execute();
        
        // Insert semester-course relationships with order
        console.log(`Inserting ${semester.courses.length} courses for semester ${semester.name}`);
        for (let i = 0; i < semester.courses.length; i++) {
          const course = semester.courses[i];
          await trx
            .insertInto('semester_courses')
            .values({
              semester_id: semester.id,
              course_id: course.id,
              order_index: i, // Store the order index
              created_at: new Date().toISOString()
            })
            .execute();
        }
      }
    });
    
    console.log('Schedule data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving schedule data:', error);
    res.status(500).json({ error: 'Failed to save schedule data' });
  }
});

export default router;