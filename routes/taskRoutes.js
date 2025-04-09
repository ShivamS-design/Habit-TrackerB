import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import Task from '../models/Task.js';

const router = express.Router();

// Get all tasks for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Task name is required' });
    }

    const newTask = new Task({ userId: req.user.id, name });
    await newTask.save();

    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark task as completed
router.put('/:taskId', verifyToken, async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task updated', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a task
router.delete('/:taskId', verifyToken, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.taskId);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
