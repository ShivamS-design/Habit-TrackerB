import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import Habit from '../models/habit.js';

const router = express.Router();

// Get all habits
router.get('/', verifyToken, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json({ habits });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new habit
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const newHabit = new Habit({ userId: req.user.id, name });
    await newHabit.save();

    res.status(201).json({ message: 'Habit created', habit: newHabit });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
