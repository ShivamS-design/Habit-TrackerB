import Task from '../models/Task.js';

// Get all tasks for a user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json({ tasks });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Task name is required' });

    const newTask = new Task({ userId: req.user.id, name });
    await newTask.save();

    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark task as completed
export const completeTask = async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.taskId, { completed }, { new: true });
    res.json({ message: 'Task updated', task });
  } catch (error) {
    console.error('Complete Task Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: error.message });
  }
};