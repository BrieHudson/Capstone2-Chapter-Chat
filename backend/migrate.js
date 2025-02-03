require('dotenv').config();
const { execSync } = require('child_process');

try {
  // Verify the DATABASE_URL is loaded
  console.log('Database URL found:', !!process.env.DATABASE_URL);
  
  // Run migrations
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}