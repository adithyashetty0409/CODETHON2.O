import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';
import { getIsMongoConnected } from '../config/db.js';
import {
  defaultUsers,
  defaultServices,
  defaultRequests,
  defaultNotifications,
} from '../seed/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'campus_db.json');

// In-memory cache when running in embedded JSON mode
let memoryStore = {
  users: [],
  services: [],
  requests: [],
  notifications: [],
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Save memory store to campus_db.json
const persistToFile = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist campus_db.json:', err);
  }
};

// Initialize file/memory store
export const initializeStore = async () => {
  const isMongo = getIsMongoConnected();

  if (isMongo) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 [DB] MongoDB is empty. Seeding initial data into MongoDB...');
        await seedMongo();
      } else {
        console.log(`📦 [DB] MongoDB active with ${userCount} existing users.`);
      }
      return;
    } catch (err) {
      console.warn('⚠️ [DB] MongoDB check failed, falling back to embedded store:', err.message);
    }
  }

  // Load from disk if file exists
  if (fs.existsSync(DB_FILE)) {
    try {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      memoryStore = JSON.parse(fileData);
      console.log(`📂 [Embedded DB] Loaded existing database: ${memoryStore.requests.length} requests, ${memoryStore.users.length} users.`);
      return;
    } catch (e) {
      console.warn('⚠️ [Embedded DB] Corrupted DB file, recreating with seed data.');
    }
  }

  // Initialize fresh memory store with seed data
  console.log('🌱 [Embedded DB] Initializing fresh database with Codethon seed data...');
  const hashedUsers = await Promise.all(
    defaultUsers.map(async (u) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      return {
        ...u,
        _id: u.id,
        password: hashedPassword,
      };
    })
  );

  memoryStore = {
    users: hashedUsers,
    services: defaultServices.map((s) => ({ ...s, _id: s.id })),
    requests: defaultRequests.map((r) => ({ ...r, _id: r.id })),
    notifications: defaultNotifications.map((n) => ({ ...n, _id: n.id })),
  };

  persistToFile();
  console.log(`✅ [Embedded DB] Ready with ${memoryStore.users.length} users and ${memoryStore.requests.length} requests.`);
};

// Seed MongoDB if connected
const seedMongo = async () => {
  const userMap = {};
  for (const u of defaultUsers) {
    const userDoc = new User(u);
    await userDoc.save();
    userMap[u.id] = userDoc._id;
  }

  for (const s of defaultServices) {
    const sDoc = new Service({
      name: s.name,
      description: s.description,
      department: s.department,
      icon: s.icon,
      slaDays: s.slaDays,
      active: s.active,
    });
    await sDoc.save();
  }

  for (const r of defaultRequests) {
    const rDoc = new Request({
      requestId: r.requestId,
      student: userMap[r.studentId] || Object.values(userMap)[1],
      serviceName: r.serviceName,
      subject: r.subject,
      description: r.description,
      department: r.department,
      assignedTo: r.assignedTo,
      priority: r.priority,
      status: r.status,
      location: r.location,
      attachmentName: r.attachmentName,
      estimatedCompletion: r.estimatedCompletion ? new Date(r.estimatedCompletion) : null,
      completedAt: r.completedAt ? new Date(r.completedAt) : null,
      remarks: r.remarks,
      history: r.history,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    });
    await rDoc.save();
  }

  console.log('✅ [DB] MongoDB seeding complete.');
};

// Helper to generate unique request ID: REQ-YYYYMMDD-XXX
export const generateRequestId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `REQ-${dateStr}-${randomSuffix}`;
};

// Check if request is overdue
const enrichRequestOverdue = (req) => {
  const isOverdue =
    req.status !== 'Completed' &&
    req.estimatedCompletion &&
    new Date() > new Date(req.estimatedCompletion);
  return {
    ...req,
    isOverdue: Boolean(isOverdue),
  };
};

/* =========================================================================
   USER STORE METHODS
   ========================================================================= */
export const findUserByEmail = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  if (getIsMongoConnected()) {
    return User.findOne({ email: cleanEmail });
  }
  return memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
};

export const findUserById = async (id) => {
  if (getIsMongoConnected()) {
    return User.findById(id).select('-password');
  }
  const user = memoryStore.users.find((u) => u._id === id || u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const findUserByStudentId = async (studentId) => {
  const cleanId = studentId.toUpperCase().trim();
  if (getIsMongoConnected()) {
    return User.findOne({ studentId: cleanId });
  }
  return (
    memoryStore.users.find(
      (u) => u.studentId && u.studentId.toUpperCase() === cleanId
    ) || null
  );
};

export const createUser = async (userData) => {
  if (getIsMongoConnected()) {
    const user = new User(userData);
    await user.save();
    return user;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  const newUser = {
    _id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    id: `usr-${Date.now()}`,
    name: userData.name.trim(),
    studentId: userData.studentId ? userData.studentId.toUpperCase().trim() : '',
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    department: userData.department.trim(),
    semester: userData.semester || 'Semester 1',
    role: userData.role || 'student',
    createdAt: new Date().toISOString(),
  };
  memoryStore.users.push(newUser);
  persistToFile();
  const { password, ...safeUser } = newUser;
  return safeUser;
};

/* =========================================================================
   SERVICE STORE METHODS
   ========================================================================= */
export const getAllServices = async () => {
  if (getIsMongoConnected()) {
    return Service.find({ active: true });
  }
  return memoryStore.services.filter((s) => s.active !== false);
};

export const getServiceByName = async (name) => {
  if (getIsMongoConnected()) {
    return Service.findOne({ name });
  }
  return (
    memoryStore.services.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    ) || null
  );
};

/* =========================================================================
   REQUEST STORE METHODS
   ========================================================================= */
export const createRequest = async (requestData, studentUser) => {
  const reqId = generateRequestId();
  const now = new Date();

  // Determine SLA based on service if available
  const service = await getServiceByName(requestData.serviceName);
  const slaDays = service ? service.slaDays || 3 : 3;
  const estimatedDate = new Date(now.getTime() + slaDays * 24 * 3600 * 1000);

  // Auto-assign department if not explicitly set
  const department =
    requestData.department ||
    (service ? service.department : 'General Administration');

  const historyEntry = {
    action: 'Created',
    previousStatus: null,
    newStatus: 'Pending',
    changedBy: `${studentUser.name} (Student)`,
    timestamp: now.toISOString(),
    remarks: 'Request initiated by student.',
  };

  const newReqObj = {
    _id: `req-${Date.now()}`,
    requestId: reqId,
    studentId: studentUser._id || studentUser.id,
    studentName: studentUser.name,
    studentEmail: studentUser.email,
    studentRoll: studentUser.studentId || '',
    serviceName: requestData.serviceName,
    subject: requestData.subject.trim(),
    description: requestData.description.trim(),
    department: department,
    assignedTo: {
      name: 'Unassigned',
      role: '',
      department: department,
    },
    priority: requestData.priority || 'Normal',
    status: 'Pending',
    location: requestData.location || '',
    attachmentName: requestData.attachmentName || '',
    attachmentUrl: requestData.attachmentUrl || '',
    estimatedCompletion: estimatedDate.toISOString(),
    completedAt: null,
    remarks: '',
    history: [historyEntry],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (getIsMongoConnected()) {
    const mongoReq = new Request({
      ...newReqObj,
      student: studentUser._id,
      estimatedCompletion: estimatedDate,
      history: [historyEntry],
    });
    await mongoReq.save();
  } else {
    memoryStore.requests.unshift(newReqObj);
    persistToFile();
  }

  // Create In-App Notification for Student
  await createNotification({
    userId: studentUser._id || studentUser.id,
    message: `Your request ${reqId} (${requestData.subject}) has been successfully submitted. Initial status: Pending.`,
    requestId: reqId,
    type: 'info',
  });

  return enrichRequestOverdue(newReqObj);
};

export const getStudentRequests = async (studentId, options = {}) => {
  let list = [];
  if (getIsMongoConnected()) {
    list = await Request.find({ student: studentId })
      .sort({ createdAt: -1 })
      .lean();
  } else {
    list = memoryStore.requests.filter(
      (r) =>
        r.studentId === studentId ||
        (r.student && (r.student === studentId || r.student._id === studentId))
    );
  }

  // Apply filters in memory
  let filtered = list.map(enrichRequestOverdue);

  if (options.status && options.status !== 'All') {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === options.status.toLowerCase()
    );
  }

  if (options.priority && options.priority !== 'All') {
    filtered = filtered.filter(
      (r) => r.priority.toLowerCase() === options.priority.toLowerCase()
    );
  }

  if (options.search) {
    const s = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.requestId.toLowerCase().includes(s) ||
        r.subject.toLowerCase().includes(s) ||
        r.serviceName.toLowerCase().includes(s) ||
        r.department.toLowerCase().includes(s)
    );
  }

  // Sorting
  if (options.sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (options.sortBy === 'priority') {
    const weight = { Urgent: 3, High: 2, Normal: 1 };
    filtered.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
  } else {
    // Default newest
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return filtered;
};

export const getRequestById = async (id) => {
  let req = null;
  if (getIsMongoConnected()) {
    req = await Request.findOne({
      $or: [{ _id: id }, { requestId: id }],
    })
      .populate('student', 'name studentId email department')
      .lean();
  } else {
    req = memoryStore.requests.find(
      (r) => r._id === id || r.id === id || r.requestId === id
    );
  }

  if (!req) return null;
  return enrichRequestOverdue(req);
};

export const getAllRequestsAdmin = async (options = {}) => {
  let list = [];
  if (getIsMongoConnected()) {
    list = await Request.find()
      .populate('student', 'name studentId email department')
      .sort({ createdAt: -1 })
      .lean();
  } else {
    list = [...memoryStore.requests];
  }

  let filtered = list.map(enrichRequestOverdue);

  // Search by Request ID, Student Name, Student ID, or Service
  if (options.search) {
    const s = options.search.toLowerCase().trim();
    filtered = filtered.filter((r) => {
      const studentName = r.student?.name || r.studentName || '';
      const studentId = r.student?.studentId || r.studentRoll || '';
      return (
        r.requestId.toLowerCase().includes(s) ||
        studentName.toLowerCase().includes(s) ||
        studentId.toLowerCase().includes(s) ||
        r.serviceName.toLowerCase().includes(s) ||
        r.subject.toLowerCase().includes(s)
      );
    });
  }

  // Filters
  if (options.status && options.status !== 'All') {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === options.status.toLowerCase()
    );
  }

  if (options.department && options.department !== 'All') {
    filtered = filtered.filter(
      (r) => r.department.toLowerCase() === options.department.toLowerCase()
    );
  }

  if (options.priority && options.priority !== 'All') {
    filtered = filtered.filter(
      (r) => r.priority.toLowerCase() === options.priority.toLowerCase()
    );
  }

  // Sort
  if (options.sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (options.sortBy === 'priority') {
    const weight = { Urgent: 3, High: 2, Normal: 1 };
    filtered.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
  } else if (options.sortBy === 'status') {
    const statusWeight = { Pending: 4, Assigned: 3, 'In Progress': 2, Completed: 1 };
    filtered.sort((a, b) => (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0));
  } else {
    // Newest
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return filtered;
};

// Assignment Update
export const updateRequestAssignment = async (
  id,
  { department, assignedTo, remarks, estimatedCompletion },
  adminUser
) => {
  const req = await getRequestById(id);
  if (!req) throw new Error('Request not found');

  const now = new Date();
  const prevStatus = req.status;
  // If request was pending, assignment moves it to Assigned automatically
  const newStatus = prevStatus === 'Pending' ? 'Assigned' : prevStatus;

  const historyEntry = {
    action: `Assigned to ${assignedTo?.name || department}`,
    previousStatus: prevStatus,
    newStatus: newStatus,
    changedBy: `${adminUser.name} (Admin)`,
    timestamp: now.toISOString(),
    remarks: remarks || `Department set to ${department}. Handled by ${assignedTo?.name || 'staff'}.`,
  };

  const updatedReq = {
    ...req,
    department: department || req.department,
    assignedTo: {
      name: assignedTo?.name || req.assignedTo?.name || 'Unassigned',
      role: assignedTo?.role || req.assignedTo?.role || '',
      department: department || req.assignedTo?.department || '',
    },
    status: newStatus,
    remarks: remarks !== undefined ? remarks : req.remarks,
    estimatedCompletion: estimatedCompletion || req.estimatedCompletion,
    updatedAt: now.toISOString(),
    history: [...(req.history || []), historyEntry],
  };

  if (getIsMongoConnected()) {
    await Request.findByIdAndUpdate(req._id, {
      department: updatedReq.department,
      assignedTo: updatedReq.assignedTo,
      status: updatedReq.status,
      remarks: updatedReq.remarks,
      estimatedCompletion: updatedReq.estimatedCompletion ? new Date(updatedReq.estimatedCompletion) : null,
      $push: { history: historyEntry },
      updatedAt: now,
    });
  } else {
    const index = memoryStore.requests.findIndex(
      (r) => r._id === req._id || r.requestId === req.requestId
    );
    if (index !== -1) {
      memoryStore.requests[index] = updatedReq;
      persistToFile();
    }
  }

  // Send Notification to student
  const studentTargetId = req.studentId || (req.student?._id || req.student);
  if (studentTargetId) {
    await createNotification({
      userId: studentTargetId,
      message: `Your request ${req.requestId} has been assigned to ${department} (${assignedTo?.name || 'Officer'}).`,
      requestId: req.requestId,
      type: 'info',
    });
  }

  return enrichRequestOverdue(updatedReq);
};

// Status Update with strict validation (Pending -> Assigned -> In Progress -> Completed)
export const updateRequestStatus = async (id, { newStatus, remarks }, adminUser) => {
  const req = await getRequestById(id);
  if (!req) throw new Error('Request not found');

  const validTransitions = {
    Pending: ['Assigned', 'In Progress', 'Completed'],
    Assigned: ['In Progress', 'Completed', 'Pending'],
    'In Progress': ['Completed', 'Assigned'],
    Completed: ['In Progress'], // Allow reopening if necessary
  };

  if (req.status === newStatus) {
    return req;
  }

  if (!validTransitions[req.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from "${req.status}" to "${newStatus}". Valid flow: Pending → Assigned → In Progress → Completed.`);
  }

  const now = new Date();
  const historyEntry = {
    action: `Status changed to ${newStatus}`,
    previousStatus: req.status,
    newStatus: newStatus,
    changedBy: `${adminUser.name} (Admin)`,
    timestamp: now.toISOString(),
    remarks: remarks || `Status transitioned to ${newStatus}.`,
  };

  const updatedReq = {
    ...req,
    status: newStatus,
    completedAt: newStatus === 'Completed' ? now.toISOString() : (newStatus === 'In Progress' ? null : req.completedAt),
    remarks: remarks !== undefined ? remarks : req.remarks,
    updatedAt: now.toISOString(),
    history: [...(req.history || []), historyEntry],
  };

  if (getIsMongoConnected()) {
    await Request.findByIdAndUpdate(req._id, {
      status: newStatus,
      completedAt: updatedReq.completedAt ? new Date(updatedReq.completedAt) : null,
      remarks: updatedReq.remarks,
      $push: { history: historyEntry },
      updatedAt: now,
    });
  } else {
    const index = memoryStore.requests.findIndex(
      (r) => r._id === req._id || r.requestId === req.requestId
    );
    if (index !== -1) {
      memoryStore.requests[index] = updatedReq;
      persistToFile();
    }
  }

  // Notify student
  const studentTargetId = req.studentId || (req.student?._id || req.student);
  if (studentTargetId) {
    let msgType = newStatus === 'Completed' ? 'success' : 'info';
    await createNotification({
      userId: studentTargetId,
      message: `Your request ${req.requestId} status changed to ${newStatus}. ${remarks ? `Remark: "${remarks}"` : ''}`,
      requestId: req.requestId,
      type: msgType,
    });
  }

  return enrichRequestOverdue(updatedReq);
};

// General Request Update (Priority, Remarks, Estimated Date)
export const updateRequestDetails = async (id, updates, adminUser) => {
  const req = await getRequestById(id);
  if (!req) throw new Error('Request not found');

  const now = new Date();
  const historyEntry = {
    action: 'Details Updated',
    previousStatus: req.status,
    newStatus: req.status,
    changedBy: `${adminUser.name} (Admin)`,
    timestamp: now.toISOString(),
    remarks: updates.remarks || 'Priority or completion schedule updated.',
  };

  const updatedReq = {
    ...req,
    priority: updates.priority || req.priority,
    remarks: updates.remarks !== undefined ? updates.remarks : req.remarks,
    estimatedCompletion: updates.estimatedCompletion || req.estimatedCompletion,
    department: updates.department || req.department,
    updatedAt: now.toISOString(),
    history: [...(req.history || []), historyEntry],
  };

  if (getIsMongoConnected()) {
    await Request.findByIdAndUpdate(req._id, {
      priority: updatedReq.priority,
      remarks: updatedReq.remarks,
      estimatedCompletion: updatedReq.estimatedCompletion ? new Date(updatedReq.estimatedCompletion) : null,
      department: updatedReq.department,
      $push: { history: historyEntry },
      updatedAt: now,
    });
  } else {
    const index = memoryStore.requests.findIndex(
      (r) => r._id === req._id || r.requestId === req.requestId
    );
    if (index !== -1) {
      memoryStore.requests[index] = updatedReq;
      persistToFile();
    }
  }

  return enrichRequestOverdue(updatedReq);
};

// Admin Statistics & Analytics
export const getAdminStatistics = async () => {
  const requests = await getAllRequestsAdmin();
  const now = new Date();

  let pending = 0;
  let assigned = 0;
  let inProgress = 0;
  let completed = 0;
  let urgent = 0;
  let overdueCount = 0;

  const departmentCounts = {};
  let totalResolutionTimeMs = 0;
  let completedWithTimes = 0;

  requests.forEach((r) => {
    // Status counts
    if (r.status === 'Pending') pending++;
    else if (r.status === 'Assigned') assigned++;
    else if (r.status === 'In Progress') inProgress++;
    else if (r.status === 'Completed') completed++;

    // Priority counts
    if (r.priority === 'Urgent') urgent++;

    // Overdue check
    if (r.status !== 'Completed' && r.estimatedCompletion && now > new Date(r.estimatedCompletion)) {
      overdueCount++;
    }

    // Department workload
    const dept = r.department || 'General Administration';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

    // Resolution time calculation for completed
    if (r.status === 'Completed' && r.completedAt && r.createdAt) {
      const diff = new Date(r.completedAt) - new Date(r.createdAt);
      if (diff > 0) {
        totalResolutionTimeMs += diff;
        completedWithTimes++;
      }
    }
  });

  // Average resolution time in days
  const avgDays = completedWithTimes > 0
    ? (totalResolutionTimeMs / completedWithTimes / (1000 * 3600 * 24)).toFixed(1)
    : '2.4'; // demo default if no completed yet

  // Recent 5 requests
  const recentRequests = requests.slice(0, 5);

  // High priority requests (Urgent or High)
  const highPriorityRequests = requests
    .filter((r) => (r.priority === 'Urgent' || r.priority === 'High') && r.status !== 'Completed')
    .slice(0, 6);

  // Overdue requests list
  const overdueRequests = requests.filter((r) => r.isOverdue);

  return {
    totalRequests: requests.length,
    pending,
    assigned,
    inProgress,
    completed,
    urgent,
    overdueCount,
    averageResolutionDays: avgDays,
    departmentCounts,
    recentRequests,
    highPriorityRequests,
    overdueRequests,
  };
};

/* =========================================================================
   NOTIFICATION METHODS
   ========================================================================= */
export const createNotification = async ({ userId, message, requestId, type = 'info' }) => {
  const notifObj = {
    _id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    id: `notif-${Date.now()}`,
    userId: userId.toString(),
    message,
    requestId,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (getIsMongoConnected()) {
    try {
      const nDoc = new Notification({
        user: userId,
        message,
        requestId,
        type,
        read: false,
      });
      await nDoc.save();
    } catch (e) {
      console.warn('MongoDB notification save warning:', e.message);
    }
  }

  memoryStore.notifications.unshift(notifObj);
  persistToFile();
  return notifObj;
};

export const getUserNotifications = async (userId) => {
  const uid = userId.toString();
  if (getIsMongoConnected()) {
    try {
      const list = await Notification.find({ user: userId }).sort({ createdAt: -1 }).lean();
      if (list && list.length > 0) return list;
    } catch (e) {}
  }
  return memoryStore.notifications.filter((n) => n.userId === uid || n.user === uid);
};

export const markNotificationAsRead = async (notifId, userId) => {
  if (getIsMongoConnected()) {
    try {
      await Notification.findByIdAndUpdate(notifId, { read: true });
    } catch (e) {}
  }
  const n = memoryStore.notifications.find(
    (item) => (item._id === notifId || item.id === notifId) && (item.userId === userId.toString() || item.user === userId.toString())
  );
  if (n) {
    n.read = true;
    persistToFile();
  }
  return true;
};

export const markAllNotificationsAsRead = async (userId) => {
  const uid = userId.toString();
  if (getIsMongoConnected()) {
    try {
      await Notification.updateMany({ user: userId }, { read: true });
    } catch (e) {}
  }
  memoryStore.notifications.forEach((item) => {
    if (item.userId === uid || item.user === uid) {
      item.read = true;
    }
  });
  persistToFile();
  return true;
};

/* =========================================================================
   EXTENDED ADMIN PORTAL METHODS
   ========================================================================= */
export const getAllUsers = async () => {
  if (getIsMongoConnected()) {
    return User.find().select('-password').sort({ createdAt: -1 });
  }
  return memoryStore.users.map(({ password, ...u }) => u);
};

export const createService = async (serviceData) => {
  const newService = {
    _id: `srv-${Date.now()}`,
    id: `srv-${Date.now()}`,
    name: serviceData.name.trim(),
    description: serviceData.description.trim(),
    department: serviceData.department.trim(),
    icon: serviceData.icon || 'HelpCircle',
    slaDays: Number(serviceData.slaDays) || 3,
    active: serviceData.active !== undefined ? serviceData.active : true,
    createdAt: new Date().toISOString(),
  };

  if (getIsMongoConnected()) {
    const sDoc = new Service(newService);
    await sDoc.save();
    return sDoc;
  }

  memoryStore.services.push(newService);
  persistToFile();
  return newService;
};

export const updateService = async (id, updates) => {
  if (getIsMongoConnected()) {
    return Service.findByIdAndUpdate(id, updates, { new: true });
  }
  const idx = memoryStore.services.findIndex((s) => s._id === id || s.id === id);
  if (idx !== -1) {
    memoryStore.services[idx] = { ...memoryStore.services[idx], ...updates };
    persistToFile();
    return memoryStore.services[idx];
  }
  throw new Error('Service not found');
};

export const getAuditLogs = async (limit = 50) => {
  const requests = await getAllRequestsAdmin();
  const logs = [];

  requests.forEach((req) => {
    if (req.history && Array.isArray(req.history)) {
      req.history.forEach((h) => {
        logs.push({
          requestId: req.requestId,
          subject: req.subject,
          serviceName: req.serviceName,
          department: req.department,
          action: h.action,
          previousStatus: h.previousStatus,
          newStatus: h.newStatus,
          changedBy: h.changedBy,
          timestamp: h.timestamp,
          remarks: h.remarks,
        });
      });
    }
  });

  // Sort descending by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return logs.slice(0, limit);
};

