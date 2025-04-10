import mongoose from 'mongoose';
import { User, Habit, Task, LocalData } from '../models/index.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Ensure indexes are built
    await Promise.all([
      User.init(),
      Habit.init(),
      Task.init(),
      LocalData.init(),
    ]);

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Optional: Stop app if DB fails
  }
};

export default connectDB;
