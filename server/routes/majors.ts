import express from 'express';
import { db } from '../database/connection.js';

const router = express.Router();

// Get all major settings
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Fetching major settings...');
    
    const majors = await db
      .selectFrom('major_settings')
      .selectAll()
      .orderBy('display_order', 'asc')
      .execute();
    
    console.log(`Found ${majors.length} major settings`);
    
    res.json(majors);
  } catch (error) {
    console.error('Error fetching major settings:', error);
    res.status(500).json({ error: 'Failed to fetch major settings' });
  }
});

// Update major settings
router.put('/', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Updating major settings...');
    const { majors } = req.body;
    
    if (!Array.isArray(majors)) {
      res.status(400).json({ error: 'Invalid majors data' });
      return;
    }
    
    // Start transaction
    await db.transaction().execute(async (trx) => {
      // Clear existing settings
      await trx.deleteFrom('major_settings').execute();
      
      // Insert updated settings
      for (const major of majors) {
        await trx
          .insertInto('major_settings')
          .values({
            id: major.id,
            name: major.name,
            color: major.color,
            display_order: major.display_order,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .execute();
      }
    });
    
    console.log('Major settings updated successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating major settings:', error);
    res.status(500).json({ error: 'Failed to update major settings' });
  }
});

export default router;