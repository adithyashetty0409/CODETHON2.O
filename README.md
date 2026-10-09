# 🎓 Smart Campus Service Management System (SMS)
**College Codethon 2026 Submission**

> A modern, responsive, full-stack centralized service management and request fulfillment platform for colleges and universities.

---

## 📌 Problem Statement

Traditional university campus administration often suffers from:
* **Fragmented and manual communication**: Physical paper request slips, untracked emails, and verbal follow-ups leading to lost requests.
* **Lack of transparency**: Students have no visibility into who is processing their certificate, lab reservation, or maintenance ticket.
* **Unclear SLAs and delayed turnaround**: No automated escalation when requests exceed reasonable timelines.
* **Administrative bottlenecks**: Lack of department workload metrics and centralized triage for urgent campus issues.

**Smart Campus Service Management System (SMS)** resolves this by providing a unified digital portal with automated department routing, real-time workflow tracking, SLA escalation, and full audit logging.

---

## 🚀 Project Overview

Smart Campus SMS provides two specialized, role-guarded experiences:

1. **Student Portal**:
   - Register with institutional Student ID and Department.
   - Browse catalog of 7+ campus services (Certificates, Lab Equipment, Maintenance, Leave Applications, ID Card, Library, and General).
   - Submit service requests with auto-generated unique Request IDs (e.g. `REQ-20261006-863`).
   - Visual 4-stage Workflow Tracker (`Pending` → `Assigned` → `In Progress` → `Completed`).
   - In-app notification center for real-time status alerts and remarks.
   - Search, filter, and sort request history.

2. **Admin & Faculty Dashboard**:
   - High-level KPI operational statistics (Total, Pending, Assigned, In Progress, Completed, Urgent).
   - Dynamic **Average Resolution Time** computation.
   - **Department Workload Distribution** visualization.
   - **SLA Escalation Alerts** automatically flagging overdue requests.
   - Master request management table with multi-factor search and filtering.
   - Assignment modal to dispatch tickets to specific departments and faculty leads.
   - Strict workflow transition validation to prevent invalid state skips.

---

## 🛠️ Tech Stack

### Frontend
* **React 19** with **Vite 8** (Lightning fast bundling)
* **Tailwind CSS v4** (Modern utility styling, glassmorphism, responsive grid)
* **Lucide React** (Clean, modern iconography)
* **React Router DOM v7** (Role-based protected routing)
* **Axios** (JWT interceptor and API client)
* **Canvas-Confetti** (Submission celebration UX)

### Backend
* **Node.js** & **Express.js 5** (RESTful API architecture)
* **JSON Web Token (JWT)** & **bcryptjs** (Stateless authentication & password hashing)
* **Morgan & CORS** (Logging and cross-origin handling)

### Database & Persistence
* **MongoDB & Mongoose**: Full schema definitions for `User`, `Service`, `Request`, and `Notification`.
* **Zero-Setup Embedded Engine**: Automatically detects local/remote MongoDB. If a local MongoDB daemon is not running on the evaluator's machine, it seamlessly activates the persistent file-backed JSON engine (`campus_db.json`) ensuring **100% demo-readiness out-of-the-box with zero configuration**.

---

## 🏗️ System Architecture

```
[ Frontend: React 19 + Vite ] 
          │  (Port 5173)
          │  REST API calls (JWT Bearer Auth)
          ▼
[ Backend: Express.js REST API ] 
          │  (Port 5000)
          ├─► /api/auth          (Register, Login, Profile)
          ├─► /api/services      (Catalog list, SLA data)
          ├─► /api/requests      (Create, Student 'My Requests', Details)
          ├─► /api/admin         (Statistics, All Requests, Assign, Status)
          └─► /api/notifications (In-app alerts, Read indicators)
          │
          ▼
[ Data Layer: Hybrid Engine ]
          ├── MongoDB + Mongoose (when MONGODB_URI is connected)
          └── Embedded Persistent JSON Store (automatic zero-dependency fallback)
```

---

## 🗄️ Database Structure

### 1. User
* `name`: String
* `studentId`: String (unique for students)
* `email`: String (unique, institutional)
* `password`: String (bcrypt hashed)
* `department`: String
* `semester`: String
* `role`: `'student'` | `'admin'` | `'faculty'`
* `createdAt`: Date

### 2. Service
* `name`: String (e.g. "Certificate Request")
* `description`: String
* `department`: String (default routed department)
* `icon`: String (Lucide icon identifier)
* `slaDays`: Number (standard turnaround estimate)
* `active`: Boolean

### 3. Request
* `requestId`: String (unique identifier, e.g. `REQ-20261006-863`)
* `student`: ObjectId / ID reference to User
* `serviceName`: String
* `subject`: String
* `description`: String
* `department`: String
* `assignedTo`: `{ name, role, department }`
* `priority`: `'Normal'` | `'High'` | `'Urgent'`
* `status`: `'Pending'` → `'Assigned'` → `'In Progress'` → `'Completed'`
* `location`: String (e.g. "Lab 302")
* `attachmentName`: String
* `estimatedCompletion`: Date
* `completedAt`: Date
* `remarks`: String
* `history`: Array of `{ action, previousStatus, newStatus, changedBy, timestamp, remarks }`
* `isOverdue`: Virtual / Computed boolean (`now > estimatedCompletion` and `status != 'Completed'`)

### 4. Notification
* `user`: User ID reference
* `message`: String
* `requestId`: String
* `type`: `'info'` | `'success'` | `'warning'` | `'escalation'`
* `read`: Boolean
* `createdAt`: Date

---

## 📡 REST API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Protected | Get profile for current JWT token |
| `GET` | `/api/services` | Public / Protected | Get available campus services |
| `POST` | `/api/requests` | Student | Submit new service request |
| `GET` | `/api/requests/my` | Student | Get requests submitted by current student |
| `GET` | `/api/requests/:id` | Student / Admin | Get detailed request with history timeline |
| `GET` | `/api/admin/requests` | Admin / Faculty | Query all requests (search, filter, sort) |
| `GET` | `/api/admin/statistics` | Admin / Faculty | Get KPIs, resolution time & workload metrics |
| `PUT` | `/api/admin/requests/:id/assign` | Admin / Faculty | Assign department & faculty personnel |
| `PUT` | `/api/admin/requests/:id/status` | Admin / Faculty | Update status with workflow transition check |
| `PUT` | `/api/admin/requests/:id` | Admin / Faculty | Update priority, remarks, due date |
| `GET` | `/api/notifications` | Protected | Get in-app notifications & unread count |
| `PUT` | `/api/notifications/:id/read` | Protected | Mark single notification as read |
| `PUT` | `/api/notifications/read-all` | Protected | Mark all notifications as read |

---

## 🔑 Demo Credentials

For immediate presentation and grading during the Codethon, the database comes pre-seeded with:

### Admin / Faculty
* **Email**: `admin@campus.edu`
* **Password**: `Admin@123`
* **Role**: Admin / Campus Director
* *(Quick 1-click login button available directly on the landing page!)*

### Student #1 (Alex Morgan)
* **Email**: `alex@student.edu`
* **Password**: `Student@123`
* **Student ID**: `STU-2024-001`
* **Department**: Computer Science (Semester 6)

### Student #2 (Priya Patel)
* **Email**: `priya@student.edu`
* **Password**: `Student@123`
* **Student ID**: `STU-2024-042`
* **Department**: Electronics & Communication (Semester 4)

### Student #3 (Rohit Verma)
* **Email**: `rohit@student.edu`
* **Password**: `Student@123`
* **Student ID**: `STU-2024-108`
* **Department**: Mechanical Engineering (Semester 8)

---

## ⚙️ Installation & Running Locally

### Prerequisites
* Node.js (v18+ recommended, tested on v22)
* npm (v9+)
* *(Optional)* Local MongoDB instance running on `localhost:27017` (not required; fallback engine runs automatically!)

### 1. Clone & Setup Workspace
```bash
cd smart-campus-sms
```

### 2. Run Backend
```bash
cd backend
npm install
npm run seed     # Populates rich demo data (users, requests, services)
npm start        # Starts Express API on http://localhost:5000
```

### 3. Run Frontend (in a separate terminal)
```bash
cd frontend
npm install
npm run dev      # Starts Vite app on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

The backend includes `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_campus_sms
JWT_SECRET=smart_campus_codethon_jwt_secret_key_2026
NODE_ENV=development
```

---

## 📸 Screenshots & UI Showcase

* **Landing Page**: Modern hero section with 1-click demo login, value pillars, and live services directory.
* **Student Dashboard**: Real-time KPI stat cards, SLA escalation warning, quick service launcher, recent tickets table.
* **Request Modal**: Auto-routed department suggestions, priority picker, attachment simulation, confetti animation on submission.
* **Visual Progress Workflow**: 4-stage connected timeline (`Pending` → `Assigned` → `In Progress` → `Completed`) with audit timestamps.
* **Admin Management Table**: Search by student name/ID/service, filter by department and status, and inline assignment drawer.
* **Department Workload Chart**: Live bar meters depicting distribution across Administration, Lab, Maintenance, and HOD offices.

---

## 🔮 Future Enhancements

1. **Email / SMS Gateway**: Automated email dispatch using SendGrid/Nodemailer for critical status changes.
2. **QR Code Verification**: QR stamp on completed Bonafide and Transcript certificates for tamper-proof physical verification.
3. **Multi-Campus Multi-Tenancy**: Separate department routing for satellite university campuses.
4. **Predictive SLA Estimations**: Machine learning model estimating resolution times based on historical technician workloads.
