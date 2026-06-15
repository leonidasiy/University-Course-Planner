import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupStaticServing } from './static-serve.js';
import scheduleRoutes from './routes/schedule.js';
import majorRoutes from './routes/majors.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/schedule', scheduleRoutes);
app.use('/api/majors', majorRoutes);

// Test endpoint
app.get('/api/hello', (req: express.Request, res: express.Response) => {
  console.log('Hello endpoint called');
  res.json({ message: 'Hello World!' });
});

// Export a function to start the server
export async function startServer(port: number | string) {
  if (process.env.NODE_ENV === 'production') {
    setupStaticServing(app);
  }

  return new Promise<void>((resolve, reject) => {
    app
      .listen(port, () => {
        console.log(`API Server running on port ${port}`);
        resolve();
      })
      .on('error', reject);
  });
}

const entryPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : null;
const isMainModule =
  entryPath !== null &&
  fileURLToPath(import.meta.url) === entryPath;

if (isMainModule) {
  startServer(process.env.PORT || 3001).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}