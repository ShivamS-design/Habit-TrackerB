import Habit from '../models/habit.js';

// Get all habits for a user
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json({ habits });
  } catch (error) {
    console.error('Get Habits Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new habit
export const createHabit = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Habit name is required' });

    const newHabit = new Habit({ userId: req.user.id, name });
    await newHabit.save();

    res.status(201).json({ message: 'Habit created', habit: newHabit });
  } catch (error) {
    console.error('Create Habit Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark habit as completed
export const completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.habitId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.completed = true;
    habit.xp += 10; // Reward XP
    await habit.save();

    res.json({ message: 'Habit completed', habit });
  } catch (error) {
    console.error('Complete Habit Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a habit
export const deleteHabit = async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.habitId);
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Delete Habit Error:', error);
    res.status(500).json({ message: error.message });
  }
};