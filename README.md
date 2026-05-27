# RadFlow - Radiation Department Patient Management System

A comprehensive, enterprise-grade web application for managing patient flow in radiation/oncology departments with role-based access, real-time notifications, and advanced analytics.

## Features

### Core Functionality
- **Patient Management**: Complete patient records with diagnoses, consultants, payment modes
- **Multi-Consultant Support**: Assign multiple consultants per patient with primary designation
- **Treatment Tracking**: Full workflow from simulation to treatment completion
- **Machine Management**: Track equipment (Elekta/Tomo) usage
- **Status Monitoring**: Visual indicators for treatment progress
- **Issue Tracking**: Document and manage patient-related issues
- **Export Functionality**: Generate Excel reports with custom filters

### Role-Based Access Control

#### Coordinator
- ✓ Add/manage team members and assign roles
- ✓ Access all features and perform all operations
- ✓ User onboarding and password management
- ✓ View comprehensive analytics

#### Doctor
- ✓ Manage diagnosis and consultant assignments
- ✓ Update treatment planning status
- ✓ Mark contouring completion
- ✓ Update machine assignments
- ✓ Cancel treatments with reasons
- ✓ Manage pending issues
- ✓ Receive notifications on assigned patients

#### Physicist
- ✓ Update planning status
- ✓ Update machine information
- ✓ Receive alerts on contouring completion
- ✓ Monitor planning timeline

#### RTT (Radiotherapy Technician)
- ✓ Update simulation status
- ✓ Mark treatment start
- ✓ Update machine assignments
- ✓ Track treatment start dates

### Smart Notifications
- **Real-time Alerts**: Instant updates on patient status changes
- **Doctor Notifications**:
  - Patient simulation completed
  - Contouring finished
  - Planning ready
  - Treatment started
  - ⚠ Warning: Treatment not started within 4 days of simulation

- **Physicist Notifications**:
  - Patient contouring completed (ready for planning)
  - ⚠ Warning: Planning not completed within 1 day of simulation

### Security & Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Email-based password recovery
- Change password functionality
- Session management
- Activity audit logging
- Hidden coordinator dashboard access

### Data Management
- PostgreSQL database with full ACID compliance
- Automatic timestamp tracking
- Activity logging for compliance
- Secure password storage
- Data export with encryption support
- Regular backup capabilities

### User Interface
- Modern, responsive design
- Dark theme for reduced eye strain
- Mobile-friendly interface
- Real-time search with suggestions
- Intuitive navigation
- Status-based color coding
- Drag-and-drop consultant assignment

## System Requirements

### Minimum
- **Backend**: Node.js 14+, PostgreSQL 11+
- **Frontend**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Server**: 2GB RAM, 2 CPU cores, 20GB storage

### Recommended
- **Backend**: Node.js 18+, PostgreSQL 14+
- **Server**: 4GB RAM, 4 CPU cores, 50GB SSD storage
- **Network**: 10Mbps connection

## Installation

### Quick Start (Docker)

```bash
# Clone repository
git clone https://github.com/yourepo/radflow.git
cd radflow

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d

# Access application
# Frontend: http://localhost
# Backend: http://localhost:5000/api
# Database: localhost:5432
```

### Manual Installation

#### Database Setup
```bash
# Create database
createdb radflow

# Initialize schema
psql -U postgres -d radflow -f schema.sql
```

#### Backend Installation
```bash
cd backend
npm install

cp .env.example .env
# Edit .env file

npm start
# Runs on port 5000
```

#### Frontend Installation
```bash
cd frontend
npm install

npm run dev
# Runs on port 5173
```

## Configuration

### Environment Variables

See `.env.example` for complete list. Key variables:

```
# Database Connection
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=radflow

# Authentication
JWT_SECRET=your-secret-key-min-32-characters

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
```

## Usage

### First Time Setup

1. **Create Coordinator Account**
   - Login with initial coordinator credentials
   - Change password immediately

2. **Add Team Members**
   - Go to User Management
   - Click "Add User"
   - Assign roles (Doctor, Physicist, RTT)
   - Share temporary credentials

3. **Add Patients**
   - Click "Add New Patient"
   - Enter patient ID and name
   - Assign primary consultant
   - Fill in initial information

4. **Track Treatment Progress**
   - Update status as patient progresses
   - Receive automatic notifications
   - Export reports as needed

### Workflow Example

```
1. Patient Registration (Coordinator/Doctor)
   ↓
2. Date of Simulation Set (RTT)
   ↓
3. Contouring Completed (Doctor/RTT)
   ↓
4. Planning Completed (Physicist)
   ↓
5. Treatment Started (RTT/Doctor)
   ↓
6. Treatment Completion
```

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
```

### Patients
```
GET    /api/patients               # List all patients
POST   /api/patients               # Create patient
GET    /api/patients/:id           # Get patient details
PUT    /api/patients/:id           # Update patient
POST   /api/patients/:id/consultants # Add consultant
```

### Consultants
```
GET    /api/consultants            # List consultants
```

### Notifications
```
GET    /api/notifications          # Get user notifications
PATCH  /api/notifications/:id/read # Mark as read
```

### Export
```
POST   /api/export/patients        # Export to Excel
```

### Users (Coordinator Only)
```
GET    /api/users                  # List users
DELETE /api/users/:id              # Deactivate user
PUT    /api/users/:id/role         # Change user role
```

## Database Schema

### Key Tables
- **users**: System users with roles
- **patients**: Patient records
- **consultants**: Doctor information
- **patient_consultants**: Patient-consultant associations
- **notifications**: System notifications
- **activity_logs**: Audit trail

See `schema.sql` for complete schema.

## Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Heroku
```bash
git push heroku main
```

### AWS/DigitalOcean/Railway
See DEPLOYMENT_GUIDE.md for detailed instructions

### Kubernetes
```bash
kubectl apply -f k8s/
```

## Performance Optimization

- Database connection pooling
- Query result caching
- Indexed database lookups
- Optimized React rendering
- Lazy loading for large lists
- Compressed API responses

## Monitoring

### Application Health
```bash
GET /api/health
```

### Logs
```bash
# Docker
docker-compose logs -f backend

# Direct application
tail -f application.log
```

### Metrics
- User login attempts
- API response times
- Database query performance
- Notification delivery rates

## Backup & Recovery

### Automated Backups
```bash
# Using pg_dump in cron
0 2 * * * pg_dump -U postgres radflow | gzip > /backups/radflow-$(date +\%Y\%m\%d).sql.gz
```

### Manual Backup
```bash
pg_dump -U postgres radflow > backup.sql
```

### Restore
```bash
psql -U postgres -d radflow < backup.sql
```

## Security

### Authentication
- JWT tokens with 7-day expiry
- Secure password hashing (bcrypt)
- Email verification for recovery
- Login attempt logging

### Data Protection
- HTTPS/SSL encryption
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Access Control
- Role-based permissions
- Field-level access control
- Activity audit logging
- Session management

## Troubleshooting

### Connection Issues
```bash
# Test database
psql -h localhost -U postgres -d radflow

# Test API
curl http://localhost:5000/api/health
```

### Password Reset
- Check email spam folder
- Verify email configuration in .env
- Check application logs for errors

### Notification Issues
- Verify cron jobs are running
- Check database for patient records
- Review application logs

## Performance Tuning

### Database
- Add indexes on frequently queried fields
- Use connection pooling (PgBouncer)
- Monitor slow queries
- Vacuum regularly

### Application
- Enable query caching
- Use CDN for static assets
- Implement request throttling
- Monitor memory usage

## Development

### Tech Stack
- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express, PostgreSQL
- **Styling**: CSS3 with CSS Variables
- **Build**: Vite (frontend), Node.js (backend)
- **Containerization**: Docker, Docker Compose

### Project Structure
```
radflow/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── schema.sql
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── docker-compose.yml
```

### Running Tests
```bash
cd backend
npm test

cd frontend
npm test
```

## Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Submit pull request

## License

MIT License - see LICENSE file

## Support

- Documentation: See DEPLOYMENT_GUIDE.md
- Issues: GitHub Issues
- Email: support@radflow.dev
- Phone: Contact your administrator

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Integration with DICOM systems
- [ ] Appointment scheduling
- [ ] Billing module
- [ ] Multi-hospital support
- [ ] Machine utilization reports
- [ ] Predictive analytics

## Credits

Developed for modern radiation oncology departments to streamline patient management and improve treatment coordination.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Support**: For issues or feature requests, contact your development team
