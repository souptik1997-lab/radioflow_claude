# RadFlow - Complete Project Structure & File Guide

## Project Overview

RadFlow is a comprehensive, enterprise-grade radiation department patient management system with:
- Role-based access control (4 roles)
- Real-time notifications
- Multi-user collaboration
- Patient tracking from simulation to treatment
- Excel export functionality
- Secure authentication with email recovery
- Automated alerts and warnings

---

## File Organization

### Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview, features, tech stack |
| **DEPLOYMENT_GUIDE.md** | Detailed deployment instructions for all platforms |
| **QUICK_START.md** | 5-30 minute setup guide for getting started |
| **API_DOCUMENTATION.md** | Complete API reference with examples |

### Database Files

| File | Purpose |
|------|---------|
| **schema.sql** | PostgreSQL database schema with all tables and indexes |

### Backend Files

| File | Purpose |
|------|---------|
| **server.js** | Express server, API routes, authentication |
| **db.js** | PostgreSQL connection configuration |
| **package.json** | Backend dependencies and scripts |
| **.env.example** | Environment variables template |

### Frontend Files

| File | Purpose |
|------|---------|
| **App.jsx** | Main React app with all pages and components |
| **App.css** | Global styles and CSS variables |
| **component-styles.css** | Individual component stylesheets |
| **components.jsx** | All React components (forms, modals, lists, etc.) |
| **frontend-package.json** | Frontend dependencies and scripts |

### Configuration Files

| File | Purpose |
|------|---------|
| **config-files.txt** | Vite config, nginx, systemd, eslint, gitignore |
| **Docker-setup.txt** | Dockerfile, docker-compose, nginx config |
| **package.json** | Backend package.json (in outputs) |

---

## Quick File Reference

### What to Read First

1. **README.md** - Understand what RadFlow does
2. **QUICK_START.md** - Get it running quickly
3. **DEPLOYMENT_GUIDE.md** - Deploy to your platform
4. **API_DOCUMENTATION.md** - Build integrations

### For Developers

1. **server.js** - Backend API logic
2. **App.jsx** + **components.jsx** - Frontend UI logic
3. **schema.sql** - Database structure
4. **.env.example** - Required configuration

### For Deployment

1. **Docker-setup.txt** - Container setup
2. **config-files.txt** - System configuration
3. **DEPLOYMENT_GUIDE.md** - Deployment steps
4. **.env.example** - Environment configuration

### For Troubleshooting

1. **QUICK_START.md** - Common issues
2. **DEPLOYMENT_GUIDE.md** - Troubleshooting section
3. **API_DOCUMENTATION.md** - API troubleshooting

---

## File-by-File Breakdown

### schema.sql
**What it does:** Defines all database tables, relationships, and indexes

**Contains:**
- users table (authentication & roles)
- patients table (patient records)
- consultants table (doctor information)
- patient_consultants table (many-to-many mapping)
- notifications table (system alerts)
- activity_logs table (audit trail)
- System constants and indexes

**When to use:**
- Initial database setup
- Reference for data structure
- Backup and restore operations

---

### server.js
**What it does:** Main Express server with all API endpoints

**Key sections:**
- Authentication endpoints (login, register, password recovery)
- Patient CRUD operations
- Consultant management
- Notifications system
- Export functionality
- Role-based access control
- Automated cron jobs for alerts

**Key features:**
- JWT token validation
- Permission checking per endpoint
- Error handling
- Logging and audit trail
- Email service integration
- Excel export generation

**When to use:**
- Backend deployment
- API development
- Integration with other systems

---

### db.js
**What it does:** PostgreSQL database connection setup

**Configuration:**
- Host, port, credentials
- SSL support
- Connection pooling
- Error handling

**When to use:**
- Development setup
- Database configuration
- Connection troubleshooting

---

### App.jsx
**What it does:** React application with routing and authentication

**Contains:**
- App component with routing setup
- LoginPage - User authentication
- DashboardPage - Statistics and overview
- PatientsPage - Patient list and search
- PatientDetailPage - Single patient view and edit
- UsersManagementPage - User administration
- ResetPasswordPage - Password recovery
- ProtectedRoute - Route protection component

**When to use:**
- Frontend development
- Adding new pages
- Modifying UI structure

---

### components.jsx
**What it does:** All React components for forms, modals, lists

**Contains:**
- PatientForm - Main patient data form
- PatientList - Patient table display
- AddPatientModal - New patient creation modal
- ExportModal - Excel export options
- AddUserModal - New user creation
- Navbar - Top navigation
- Sidebar - Left sidebar navigation
- NotificationCenter - Notification display
- StatCard - Statistics cards
- UsersList - User management table
- SettingsPage - User settings

**When to use:**
- UI modifications
- Adding new form fields
- Changing layouts

---

### CSS Files (App.css & component-styles.css)
**What they do:** Complete styling for entire application

**Features:**
- CSS variables for theming
- Dark theme optimized for medical use
- Responsive design
- Component-specific styles
- Animations and transitions
- Mobile optimization

**When to use:**
- Styling customization
- Color scheme changes
- Layout modifications

---

### package.json (Backend)
**What it does:** Lists all Node.js dependencies and scripts

**Key dependencies:**
- express - Web framework
- pg - PostgreSQL client
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- nodemailer - Email service
- exceljs - Excel generation
- node-cron - Scheduled tasks

**Scripts:**
- start - Run production server
- dev - Run with auto-reload

**When to use:**
- Installation (`npm install`)
- Understanding dependencies
- Adding new packages

---

### frontend-package.json
**What it does:** Lists all React dependencies

**Key dependencies:**
- react - UI framework
- react-router-dom - Client routing
- axios - HTTP client
- vite - Build tool

**Scripts:**
- dev - Start dev server
- build - Build for production
- preview - Preview production build

**When to use:**
- Frontend installation
- Understanding React version

---

### .env.example
**What it does:** Template for required environment variables

**Variables:**
- Database configuration (host, user, password)
- JWT secret key
- Frontend URL
- Email service credentials
- Optional: Firebase Cloud Messaging

**When to use:**
- Setting up new installation
- Reference for required config
- Creating .env file

---

### Docker-setup.txt
**What it does:** Docker configuration files for containerization

**Contains:**
- Dockerfile - Backend container
- Dockerfile.frontend - Frontend container
- docker-compose.yml - Multi-container orchestration
- nginx.conf - Web server configuration

**When to use:**
- Docker deployment
- Local development with Docker
- Production deployment

---

### config-files.txt
**What it does:** Various configuration files for production setup

**Contains:**
- vite.config.js - Frontend build config
- jest.config.js - Testing configuration
- .eslintrc.json - Code linting
- nginx.conf - Advanced nginx setup
- Makefile - Development commands
- systemd service file - Linux service setup
- .gitignore - Git ignore rules

**When to use:**
- Code quality setup
- Production optimization
- Linux deployment

---

### DEPLOYMENT_GUIDE.md
**What it does:** Comprehensive deployment instructions

**Covers:**
- Local development setup (30 minutes)
- Docker Compose (5 minutes)
- Heroku deployment
- AWS deployment
- DigitalOcean deployment
- Railway deployment
- Google Cloud Run
- Database backup/restore
- Monitoring and logging
- Scaling considerations
- Security best practices
- Troubleshooting

**When to use:**
- Deploying to production
- Setting up monitoring
- Creating backups
- Scaling application

---

### QUICK_START.md
**What it does:** Fast setup guide for getting started

**Covers:**
- 5-minute Docker setup
- 30-minute local development
- First-time user guide
- Common tasks
- Troubleshooting
- Performance tips
- Security checklist

**When to use:**
- First-time setup
- Quick reference
- Troubleshooting common issues

---

### README.md
**What it does:** Complete project documentation

**Covers:**
- Feature overview
- System requirements
- Installation instructions
- Configuration
- Usage guide
- Database schema overview
- API endpoints summary
- Tech stack description
- Performance optimization
- Security measures
- Development guidelines
- Roadmap for future

**When to use:**
- Understanding the project
- Feature reference
- Technical overview

---

### API_DOCUMENTATION.md
**What it does:** Complete API reference documentation

**Covers:**
- All endpoints with request/response examples
- Authentication flows
- CRUD operations
- Error responses
- Rate limiting
- Testing with curl and Postman
- Example workflows
- Response headers

**Endpoints covered:**
- Authentication (login, register, password reset)
- Patients (list, create, read, update)
- Consultants (list)
- Notifications (get, mark read)
- Users (list, deactivate, change role)
- Export (patient data to Excel)

**When to use:**
- API integration
- Mobile app development
- Third-party integrations
- API testing

---

## Setup Checklist

### For Development
- [ ] Read README.md
- [ ] Follow QUICK_START.md (local setup)
- [ ] Copy .env.example to .env
- [ ] Install dependencies (npm install)
- [ ] Start database (psql or Docker)
- [ ] Initialize schema (schema.sql)
- [ ] Start backend (npm run dev)
- [ ] Start frontend (npm run dev)
- [ ] Test login

### For Production
- [ ] Read DEPLOYMENT_GUIDE.md
- [ ] Choose deployment platform
- [ ] Setup database (PostgreSQL)
- [ ] Configure environment variables
- [ ] Setup email service
- [ ] Build Docker images
- [ ] Deploy backend and frontend
- [ ] Configure domain/SSL
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Create admin account
- [ ] Test all features

### For Integration
- [ ] Read API_DOCUMENTATION.md
- [ ] Setup Postman/curl tests
- [ ] Test all endpoints
- [ ] Implement error handling
- [ ] Setup retries/timeouts
- [ ] Document integration points
- [ ] Setup monitoring

---

## File Relationships

```
┌─ Documentation
│  ├─ README.md (overview)
│  ├─ QUICK_START.md (setup)
│  ├─ DEPLOYMENT_GUIDE.md (production)
│  └─ API_DOCUMENTATION.md (integration)
│
├─ Database
│  └─ schema.sql (tables & indexes)
│
├─ Backend
│  ├─ server.js (API server)
│  ├─ db.js (database connection)
│  └─ package.json (dependencies)
│
├─ Frontend
│  ├─ App.jsx (pages & routing)
│  ├─ components.jsx (UI components)
│  ├─ App.css (global styles)
│  ├─ component-styles.css (component styles)
│  └─ frontend-package.json (dependencies)
│
└─ Configuration
   ├─ config-files.txt (vite, nginx, etc.)
   ├─ Docker-setup.txt (containers)
   ├─ .env.example (environment template)
   ├─ package.json (backend deps)
   └─ frontend-package.json (frontend deps)
```

---

## Common Tasks by File

### I want to...

**Change the database schema**
- Edit: schema.sql
- Then: Run migration, restart server

**Add a new API endpoint**
- Edit: server.js
- Document: API_DOCUMENTATION.md
- Test: Use Postman or curl

**Add a new form field**
- Edit: components.jsx (PatientForm)
- Edit: App.css or component-styles.css
- Update: schema.sql if needed
- Document: README.md

**Change the login page**
- Edit: App.jsx (LoginPage)
- Edit: component-styles.css (LoginPage styles)

**Deploy to production**
- Read: DEPLOYMENT_GUIDE.md
- Configure: .env with production values
- Build: Docker images
- Deploy: Using docker-compose or your platform

**Add email notifications**
- Configure: .env (EMAIL_USER, EMAIL_PASS)
- Edit: server.js (triggerNotifications function)
- Test: Password reset flow

**Export patient data**
- Endpoint: POST /export/patients
- Code: In server.js (Excel generation)
- UI: ExportModal in components.jsx

**Add new user role**
- Edit: schema.sql (add role to check constraint)
- Edit: server.js (update checkRole function)
- Edit: components.jsx (update role checks)
- Update: API_DOCUMENTATION.md

---

## Version Information

- **RadFlow Version**: 1.0.0
- **Node.js**: 14+ (16+ recommended)
- **PostgreSQL**: 11+ (14+ recommended)
- **React**: 18.2.0
- **Express**: 4.18.2

---

## Support Resources

### Documentation
- Technical docs: All .md files
- API reference: API_DOCUMENTATION.md
- Deployment: DEPLOYMENT_GUIDE.md
- Quick help: QUICK_START.md

### Code Comments
- Backend logic: Check comments in server.js
- Component code: Check comments in App.jsx and components.jsx
- Styles: Check CSS comments in *.css files

### Getting Help
1. Check QUICK_START.md troubleshooting
2. Review DEPLOYMENT_GUIDE.md for your platform
3. Check API_DOCUMENTATION.md for integration
4. Review code comments
5. Check server and browser logs

---

## Next Steps After Setup

1. **Create Administrator Account**
   - Use initial login credentials
   - Change password immediately
   - Add team members

2. **Configure Notifications**
   - Set up email service
   - Test password reset
   - Configure cron jobs

3. **Customize for Your Hospital**
   - Add payment modes
   - Configure machines
   - Setup user roles
   - Customize notifications

4. **Train Staff**
   - Create user guides
   - Conduct training
   - Document workflows
   - Setup support

5. **Monitor & Maintain**
   - Setup monitoring
   - Configure backups
   - Review logs
   - Update documentation

---

**Last Updated**: 2024
**Document Version**: 1.0.0

For additional support, refer to the comprehensive documentation files included in this package.
