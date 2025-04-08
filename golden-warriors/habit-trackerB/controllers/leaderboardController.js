import User from '../models/User.js';


export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find().sort({ xp: -1 }).limit(10);
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
