# RadFlow Quick Start Guide

## 5-Minute Setup (Docker)

### Prerequisites
- Docker and Docker Compose installed
- 2GB RAM available

### Steps

1. **Clone & Configure**
```bash
git clone https://github.com/yourepo/radflow.git
cd radflow
cp .env.example .env
```

2. **Edit .env file**
```bash
nano .env

# Set these values:
DB_PASSWORD=choose_a_strong_password
JWT_SECRET=choose_a_random_string_min_32_chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

3. **Start Services**
```bash
docker-compose up -d
docker-compose logs -f
```

4. **Access Application**
- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- Database: localhost:5432

5. **Initial Login**
- Email: coordinator@hospital.com
- Password: (check your deployment notes)

---

## 30-Minute Setup (Local Development)

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
# 1. Create database
createdb radflow

# 2. Initialize schema
psql -U postgres -d radflow -f schema.sql

# 3. Configure backend
cd backend
cp .env.example .env
nano .env  # Update database credentials

# 4. Install dependencies
npm install

# 5. Start server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# 1. Configure frontend
cd frontend
cp .env.example .env
nano .env
# Set REACT_APP_API_URL=http://localhost:5000/api

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# App runs on http://localhost:5173
```

---

## First-Time User Guide

### 1. Administrator Setup

As the first Coordinator:
```
1. Login with your credentials
2. Go to User Management
3. Add team members:
   - Dr. Name (Doctor)
   - Physicist Name (Physicist)
   - RTT Name (RTT)
4. Share temporary passwords securely
```

### 2. Add Your First Patient

```
1. Click "Add New Patient"
2. Enter:
   - Patient ID: RAD2024001
   - Name: John Doe
   - Select primary consultant
3. Click "Add Patient"
4. Patient appears in sidebar
5. Click to open patient
6. Fill in clinical details
7. Save changes
```

### 3. Track Treatment Progress

```
As treatment progresses:
- RTT updates: Simulation date, Treatment start
- Doctor updates: Diagnosis, Contouring done, Planning done
- Physicist updates: Planning status
- All receive relevant notifications
```

---

## Default Accounts

### Coordinator Account (First Time)
```
Email: coordinator@hospital.com
Password: (set during deployment)
Role: Full access to all features
```

### Demo Accounts (Optional)

```
Doctor:
  Email: doctor@hospital.com
  Password: Doctor123!

Physicist:
  Email: physicist@hospital.com
  Password: Physicist123!

RTT:
  Email: rtt@hospital.com
  Password: RTT123!
```

---

## Common Tasks

### Change Your Password
```
1. Login
2. Click on your name (top right)
3. Click "Settings"
4. Enter current password
5. Enter new password
6. Confirm new password
7. Click "Change Password"
```

### Reset Forgotten Password
```
1. On login page, click "Forgot password?"
2. Enter your email
3. Check email for reset link
4. Click link and set new password
5. Login with new password
```

### Add a New Team Member
```
1. Go to User Management
2. Click "Add User"
3. Enter:
   - Email address
   - Full name
   - Role (Doctor/Physicist/RTT)
   - Department (optional)
   - Phone (optional)
   - Temporary password
4. Click "Create User"
5. Share credentials with new user
```

### Export Patient List
```
1. Go to Patients
2. Click "Export to Excel"
3. Select filters:
   - Consultant (optional)
   - Machine type (optional)
   - Only started patients (optional)
4. Click "Export to Excel"
5. File downloads automatically
```

### Cancel a Patient's Treatment
```
1. Open patient record
2. Click "Cancel Treatment"
3. Enter reason for cancellation
4. Click "Confirm Cancellation"
5. Patient marked as cancelled with red highlight
```

---

## Troubleshooting

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Database connection error:**
```bash
# Check if postgres is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check database
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### Development Issues

**Port already in use:**
```bash
# Change ports in .env or docker-compose.yml
# Or kill the process:
lsof -i :5000      # Find process on port 5000
kill -9 <PID>      # Kill the process
```

**Module not found errors:**
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install
```

**Database needs reset:**
```bash
# Backup current data first!
dropdb radflow
createdb radflow
psql -U postgres -d radflow -f schema.sql
```

### Application Issues

**Can't login:**
- Check email/password are correct
- Check user account is active
- Try password reset
- Check database has users table populated

**Notifications not working:**
- Check cron jobs are running
- Verify email configuration
- Check logs for errors
- Test email service separately

**Can't export to Excel:**
- Check disk space on server
- Verify /exports directory exists and is writable
- Check backend logs for errors

**Mobile app not responsive:**
- Clear browser cache
- Check viewport settings
- Test on different browsers
- Check CSS is loading properly

---

## Performance Tips

1. **Database**
   - Run `VACUUM` weekly
   - Check slow queries log
   - Use indexes on frequently queried fields

2. **Frontend**
   - Use browser DevTools to find slow components
   - Lazy load images
   - Minimize bundle size

3. **Backend**
   - Monitor memory usage
   - Check database connection pool
   - Review API response times

---

## Security Checklist

- [ ] Changed JWT_SECRET to random string
- [ ] Set strong database password
- [ ] Configured email service credentials
- [ ] Enabled HTTPS for production
- [ ] Limited database user permissions
- [ ] Backed up database
- [ ] Set up monitoring
- [ ] Reviewed user access levels
- [ ] Tested password reset flow
- [ ] Verified email notifications work

---

## Next Steps

1. **Read Full Documentation**
   - See DEPLOYMENT_GUIDE.md for detailed setup
   - See README.md for feature overview

2. **Configure Notifications**
   - Set up email service (Gmail, SendGrid, etc.)
   - Test password reset emails
   - Configure cron jobs for automated alerts

3. **Set Up Backups**
   - Configure daily database backups
   - Test backup/restore process
   - Store backups securely

4. **Monitor Application**
   - Set up error logging
   - Monitor database performance
   - Track application uptime
   - Review user access logs

5. **Train Users**
   - Create user guides
   - Conduct training sessions
   - Document workflows
   - Create video tutorials

---

## Getting Help

### Common Resources
- Check application logs: `docker-compose logs`
- Database queries: Connect with `psql`
- API testing: Use Postman or curl
- Browser console: Check for JavaScript errors

### Support Contacts
- Technical issues: dev-team@hospital.com
- Feature requests: product-team@hospital.com
- General inquiries: support@hospital.com

### Emergency Procedures
- Database corrupted: Restore from backup
- Server down: Check status page
- Data loss: Contact backup administrator
- Security breach: Immediately notify admin

---

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Database backup
docker-compose exec postgres pg_dump -U postgres radflow > backup.sql

# Database restore
docker-compose exec postgres psql -U postgres -d radflow < backup.sql

# Reset database
docker-compose exec postgres dropdb -U postgres radflow
docker-compose exec postgres createdb -U postgres radflow
docker-compose exec postgres psql -U postgres -d radflow < schema.sql

# Restart services
docker-compose restart

# View resource usage
docker stats

# Clean up volumes
docker-compose down -v

# Full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

Version: 1.0.0
Last Updated: 2024
For latest updates, visit: https://docs.radflow.dev
