require('dotenv').config();
const { execSync } = require('child_process');

try {
  // Verify the DATABASE_URL is loaded
  console.log('Database URL found:', !!process.env.DATABASE_URL);
  
  // Run seeders
  execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
} catch (error) {
  console.error('Seeding failed:', error);
  process.exit(1);
}