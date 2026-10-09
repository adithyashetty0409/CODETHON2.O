import express from 'express';
import {
  getAllRequestsAdmin,
  getAdminStatistics,
  getRequestById,
  updateRequestAssignment,
  updateRequestStatus,
  updateRequestDetails,
  getAllUsers,
  createService,
  updateService,
  getAuditLogs,
} from '../services/store.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and role-based guard for all admin endpoints
router.use(protect);
router.use(authorize('admin', 'faculty'));

// GET /api/admin/requests - Fetch all requests with filters & sorting
router.get('/requests', async (req, res) => {
  try {
    const { search, status, department, priority, sortBy } = req.query;

    const requests = await getAllRequestsAdmin({
      search,
      status,
      department,
      priority,
      sortBy,
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Admin fetch requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative requests.',
    });
  }
});

// GET /api/admin/statistics - Analytics overview
router.get('/statistics', async (req, res) => {
  try {
    const stats = await getAdminStatistics();
    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute campus service metrics.',
    });
  }
});

// PUT /api/admin/requests/:id/assign - Department and person assignment
router.put('/requests/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { department, assignedTo, remarks, estimatedCompletion } = req.body;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for assignment.',
      });
    }

    const updated = await updateRequestAssignment(
      id,
      { department, assignedTo, remarks, estimatedCompletion },
      req.user
    );

    return res.json({
      success: true,
      message: `Request ${updated.requestId} successfully assigned to ${department}.`,
      data: updated,
    });
  } catch (error) {
    console.error('Assignment error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update assignment.',
    });
  }
});

// PUT /api/admin/requests/:id/status - Status transition management
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Target status is required.',
      });
    }

    const updated = await updateRequestStatus(
      id,
      { newStatus: status, remarks },
      req.user
    );

    return res.json({
      success: true,
      message: `Request ${updated.requestId} status advanced to ${updated.status}.`,
      data: updated,
    });
  } catch (error) {
    console.error('Status transition error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Status transition rejected.',
    });
  }
});

// PUT /api/admin/requests/:id - General updates (Priority, Remarks, Due Date)
router.put('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, remarks, estimatedCompletion, department } = req.body;

    const updated = await updateRequestDetails(
      id,
      { priority, remarks, estimatedCompletion, department },
      req.user
    );

    return res.json({
      success: true,
      message: `Request ${updated.requestId} details updated.`,
      data: updated,
    });
  } catch (error) {
    console.error('Admin update error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update request details.',
    });
  }
});

// GET /api/admin/audit-logs - Live campus audit feed
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await getAuditLogs(req.query.limit ? parseInt(req.query.limit) : 50);
    return res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit log.' });
  }
});

// GET /api/admin/users - User directory
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve user list.' });
  }
});

// POST /api/admin/services - Add service
router.post('/services', async (req, res) => {
  try {
    const { name, description, department, icon, slaDays } = req.body;
    if (!name || !description || !department) {
      return res.status(400).json({ success: false, message: 'Name, description, and department are required.' });
    }
    const newSrv = await createService({ name, description, department, icon, slaDays });
    return res.status(201).json({ success: true, message: 'Campus service created.', data: newSrv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create service.' });
  }
});

// PUT /api/admin/services/:id - Update service
router.put('/services/:id', async (req, res) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    return res.json({ success: true, message: 'Campus service updated.', data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update service.' });
  }
});

export default router;

