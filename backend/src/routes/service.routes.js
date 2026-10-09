import express from 'express';
import { getAllServices } from '../services/store.js';

const router = express.Router();

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const services = await getAllServices();
    return res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Fetch services error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campus services.',
    });
  }
});

export default router;
