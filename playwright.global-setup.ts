import { execSync } from 'child_process';
import { resolve } from 'path';

async function globalSetup() {
  console.log('Resetting and seeding test database for Playwright...');
  const backendDir = resolve(__dirname, '../accounting');
  try {
    // Run db push with force-reset to clean everything, then seed default data
    execSync('yes | npx dotenv-cli -e .env.test -- npx prisma db push --force-reset --accept-data-loss', {
      cwd: backendDir,
      stdio: 'inherit',
    });
    execSync('yes | npx dotenv-cli -e .env.test -- npx tsx prisma/seed.ts', {
      cwd: backendDir,
      stdio: 'inherit',
    });
    console.log('Test database is ready.');
  } catch (error) {
    console.error('Failed to reset and seed test database:', error);
    throw error;
  }
}

export default globalSetup;
