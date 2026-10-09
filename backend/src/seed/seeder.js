import dotenv from 'dotenv';
import connectDB, { getIsMongoConnected } from '../config/db.js';
import { initializeStore } from '../services/store.js';

dotenv.config();

const runSeed = async () => {
  console.log('🚀 [Seeder] Starting data population for Smart Campus System...');
  await connectDB();
  await initializeStore();
  console.log('🎉 [Seeder] Seed process successfully completed!');
  process.exit(0);
};

runSeed().catch((err) => {
  console.error('❌ [Seeder] Error during seed:', err);
  process.exit(1);
});
