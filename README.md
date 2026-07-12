# Smart Employee Management System

A secure full-stack web application to manage employees, departments, attendance, and leave requests with role-based access control.

## 🚀 Features

### Authentication System
- Admin registration and login
- Password hashing with bcryptjs
- JWT authentication
- Protected routes
- Logout functionality
- Session management
- **Role-Based Access Control (RBAC)** - Admin, Manager, Employee roles
- **Two-Factor Authentication (2FA)** - TOTP-based authentication
- **Email-based Password Reset** - Secure password recovery

### Employee Management
- Add, view, update, and delete employees
- Auto-generated employee IDs
- **Profile image upload with Cloudinary**
- Employee fields: Name, Email, Phone, Department, Designation, Salary, Joining Date, Status
- **Advanced search** - Date range, salary range, multiple departments
- **Data pagination** for efficient data loading
- **Bulk actions** - Delete multiple employees, bulk attendance

### Department Management
- Create, edit, and delete departments
- View employees by department
- Department head assignment

### Attendance Tracking
- Mark Present/Absent/Late
- Daily attendance records
- Attendance percentage calculation
- Monthly attendance summary
- Check-in/Check-out time tracking
- **Calendar view** for attendance records
- **Email notifications** when attendance is marked

### Leave Management
- Apply for leave (Sick, Casual, Annual, Emergency)
- Approve or reject leave requests
- View leave history
- Leave status tracking (Pending, Approved, Rejected)
- **Email notifications** for leave approvals/rejections
- **Calendar view** for leave records

### Dashboard
- Total employees count
- Total departments count
- Present today count
- Employees on leave today
- Recent employees
- Department-wise employee count
- Pending leave requests
- **Statistics charts** using Recharts (Pie charts, Bar charts)
- **Attendance trends** (last 7 days)

### Search, Filter & Sort
- Search employees by name or email
- Filter by department
- Filter by status
- Sort by joining date
- Sort by salary
- **Advanced filters** - Salary range, date range, multiple departments

### Export Data
- Export employees to CSV
- Download attendance reports
- Export departments to CSV
- Export leaves to CSV

### UI/UX Features
- Responsive design (mobile-friendly)
- Sidebar navigation
- Loading spinners
- Toast notifications
- Confirmation dialogs
- Form validation
- Empty state pages
- **Dark mode with theme toggle**
- **Employee profile page** with attendance history and leave balance

### Performance & Security
- **Redis caching** for frequently accessed data
- **Jest unit tests** for critical functions
- Input validation with express-validator
- CORS enabled
- Environment variables for sensitive data

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- bcryptjs for password hashing
- cors for cross-origin requests
- csv-writer for data export
- **speakeasy** for 2FA authentication
- **qrcode** for QR code generation
- **nodemailer** for email notifications
- **redis** for caching
- **cloudinary** for image storage
- **multer-storage-cloudinary** for file uploads
- **jest** for unit testing
- **supertest** for API testing
- **mongodb-memory-server** for test database

### Frontend
- React.js
- React Router
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- React Toastify for notifications
- **Recharts** for statistics charts

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd employee-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee-management
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Redis Configuration (optional - app works without it)
REDIS_URL=redis://localhost:6379

# Email Configuration (for password reset and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@employeemanagement.com
EMAIL_MANAGER=manager@company.com
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration (for image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/employee-management
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start MongoDB

If using local MongoDB:
```bash
mongod
```

### Start Backend

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
employee-management-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Attendance.js
│   │   └── Leave.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── departments.js
│   │   ├── attendance.js
│   │   ├── leaves.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleAuth.js
│   ├── config/
│   │   ├── redis.js
│   │   ├── email.js
│   │   └── cloudinary.js
│   ├── __tests__/
│   │   ├── setup.js
│   │   ├── auth.test.js
│   │   └── employee.test.js
│   ├── exports/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .env (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Leaves.jsx
│   │   │   └── EmployeeProfile.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
├── .gitignore
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password with token
- `POST /api/auth/enable-2fa` - Enable 2FA
- `POST /api/auth/verify-2fa` - Verify 2FA token
- `POST /api/auth/disable-2fa` - Disable 2FA
- `POST /api/auth/login-2fa` - Login with 2FA

### Employees
- `GET /api/employees` - Get all employees (with search, filter, sort, pagination)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee (Admin & Manager)
- `PUT /api/employees/:id` - Update employee (Admin & Manager)
- `DELETE /api/employees/:id` - Delete employee (Admin only)
- `POST /api/employees/:id/profile-image` - Upload profile image (Admin & Manager)
- `GET /api/employees/export/csv` - Export employees to CSV

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department with employees
- `POST /api/departments` - Create department (Admin & Manager)
- `PUT /api/departments/:id` - Update department (Admin & Manager)
- `DELETE /api/departments/:id` - Delete department (Admin only)

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/employee/:employeeId` - Get employee attendance
- `POST /api/attendance` - Mark attendance (Admin & Manager)
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance
- `GET /api/attendance/today/summary` - Get today's attendance summary
- `GET /api/attendance/export/csv` - Export attendance to CSV

### Leaves
- `GET /api/leaves` - Get all leave requests
- `GET /api/leaves/employee/:employeeId` - Get employee leaves
- `POST /api/leaves` - Apply for leave
- `PUT /api/leaves/:id/status` - Approve/Reject leave (Admin & Manager)
- `DELETE /api/leaves/:id` - Delete leave request
- `GET /api/leaves/export/csv` - Export leaves to CSV

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (with Redis caching)

## 👤 Default Admin

After registration, the first user will be an admin. Register at:
- Email: `admin@example.com`
- Password: `admin123` (minimum 6 characters)

## 🎯 Usage Guide

1. **Register**: Create an admin account
2. **Login**: Sign in with your credentials
3. **Create Departments**: Add departments first before adding employees
4. **Add Employees**: Create employee records
5. **Mark Attendance**: Daily attendance tracking
6. **Manage Leaves**: Approve/reject leave requests
7. **View Dashboard**: Monitor statistics and overview

## 🌐 Deployment

### Backend Deployment (Heroku/Render)

1. Create a `.env` file with production values
2. Deploy backend to Heroku/Render
3. Update MongoDB URI to production database
4. Set JWT_SECRET in environment variables

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to Netlify/Vercel
3. Set `REACT_APP_API_URL` to production backend URL

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes
- Input validation
- CORS enabled
- Environment variables for sensitive data

## 🐛 Known Issues

- CSV export requires the exports folder to exist
- Profile image upload needs additional setup (currently optional)

## 🚧 Future Enhancements

- [ ] Profile image upload with cloud storage
- [ ] Email notifications for leave approvals
- [ ] Advanced reporting and analytics
- [ ] Employee performance tracking
- [ ] Payroll management
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Mobile app version

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Marri Venkata Kasi Vardhan**

- LinkedIn: [Your LinkedIn]
- GitHub: [Your GitHub]
- Email: [Your Email]

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Tailwind CSS for the utility-first CSS framework
- Lucide for beautiful icons
#
