import { startServer } from '../server/index.js';
import { createServer } from 'vite';

let viteServer;

async function startDev() {
  // Start the Express API server first
  try {
    // Start API on 3002 to avoid clashing with Vite's default 3000
    await startServer(3002);
  } catch (err) {
    console.error('API server failed to start, aborting dev startup:', err);
    process.exit(1);
  }

  // Then start Vite in dev mode
  try {
    viteServer = await createServer({
      configFile: './vite.config.js',
    });

    await viteServer.listen();

    // Determine the actual listening port (in case Vite fell back to a different port)
    const addr = viteServer.httpServer?.address();
    const actualPort =
      addr && typeof addr === 'object' && 'port' in addr ? addr.port : viteServer.config.server.port;

    console.log(`Vite dev server running on port ${actualPort}`);
  } catch (err) {
    console.error('Failed to start Vite dev server:', err);
    process.exit(1);
  }
}

// Handle nodemon restarts - only needed if we're running under nodemon
if (
  process.env.npm_lifecycle_event &&
  process.env.npm_lifecycle_event.includes('watch')
) {
  let isRestarting = false;

  process.once('SIGUSR2', async () => {
    if (isRestarting) return;
    isRestarting = true;

    console.log('Nodemon restart detected, closing Vite server...');
    if (viteServer) {
      try {
        await viteServer.close();
        console.log('Vite server closed successfully');
      } catch (err) {
        console.error('Error closing Vite server:', err);
      }
    }

    // Allow nodemon to restart the process
    process.kill(process.pid, 'SIGUSR2');
  });
}

startDev();
