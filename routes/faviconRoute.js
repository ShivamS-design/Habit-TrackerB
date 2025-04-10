import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve favicon.ico
router.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  res.sendFile(faviconPath);
});

export default router;