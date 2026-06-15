import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const children: ChildProcess[] = [];

function run(label: string, command: string, args: string[]) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      return;
    }
    if (code !== 0 && code !== null) {
      console.error(`${label} exited with code ${code}`);
      shutdown(code);
    }
  });

  children.push(child);
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting API server on port 3001...');
run('API', 'npx', ['tsx', 'server/index.ts']);

console.log('Starting Vite dev server on port 3000...');
run('Vite', 'npx', ['vite', '--config', 'vite.config.js']);
