import express from 'express';
import {
  createRequest,
  getStudentRequests,
  getRequestById,
} from '../services/store.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/requests - Create a new service request
router.post('/', protect, async (req, res) => {
  try {
    const {
      serviceName,
      subject,
      description,
      department,
      priority = 'Normal',
      location = '',
      attachmentName = '',
    } = req.body;

    if (!serviceName || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Service Type, Subject/Title, and Description.',
      });
    }

    const createdReq = await createRequest(
      {
        serviceName,
        subject,
        description,
        department,
        priority,
        location,
        attachmentName,
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      message: `Request created successfully with ID ${createdReq.requestId}. Initial status: Pending.`,
      data: createdReq,
    });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit service request.',
    });
  }
});

// GET /api/requests/my - Get current student's requests with filter/sort/search
router.get('/my', protect, async (req, res) => {
  try {
    const { search, status, priority, sortBy } = req.query;
    const studentId = req.user._id || req.user.id;

    const requests = await getStudentRequests(studentId, {
      search,
      status,
      priority,
      sortBy,
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Fetch student requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your request history.',
    });
  }
});

// GET /api/requests/:id - Get specific request details
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found.',
      });
    }

    // Role check: Students should only view their own requests
    const userId = (req.user._id || req.user.id).toString();
    const studentOwnerId = (
      request.studentId || (request.student?._id || request.student)
    )?.toString();

    if (req.user.role === 'student' && studentOwnerId && studentOwnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own requests.',
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Fetch request details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve request details.',
    });
  }
});

export default router;
