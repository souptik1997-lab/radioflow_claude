# RadFlow - Deployment & Setup Guide

## Project Structure

```
radflow/
├── backend/
│   ├── server.js              # Express server
│   ├── db.js                  # Database connection
│   ├── package.json
│   ├── .env.example
│   └── schema.sql             # Database schema
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── styles/
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.frontend
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Backend Setup

```bash
cd backend
cp .env.example .env

# Edit .env with your configuration:
# DB_HOST=localhost
# DB_NAME=radflow
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your-secret-key
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

npm install

# Initialize database
psql -U postgres -f schema.sql

# Start server
npm run dev    # Development
npm start      # Production
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env

# Edit .env:
# REACT_APP_API_URL=http://localhost:5000/api

npm install
npm run dev
```

Access frontend at `http://localhost:5173`

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your settings

# Build and run
docker-compose up -d

# Initialize database
docker-compose exec backend npm run db:init

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Access at:
- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- Database: localhost:5432

---

## Cloud Deployment Options

### Option 1: Heroku (Backend) + Vercel (Frontend)

#### Backend on Heroku

```bash
# Install Heroku CLI
# heroku login

# Create app
heroku create radflow-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASS=your-password

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:init
```

#### Frontend on Vercel

```bash
# Install Vercel CLI
# npm i -g vercel

# Set environment
# Create .env.local:
# REACT_APP_API_URL=https://radflow-api.herokuapp.com/api

# Deploy
vercel
```

### Option 2: AWS (EC2 + RDS)

```bash
# 1. Create EC2 instance (Ubuntu 22.04)
# 2. Create RDS PostgreSQL database
# 3. SSH into EC2

sudo apt update
sudo apt install nodejs npm postgresql-client nginx git

# Clone repository
git clone your-repo
cd radflow/backend

# Install dependencies
npm install

# Create .env
nano .env
# Update with RDS endpoint and credentials

# Build frontend
cd ../frontend
npm install
npm run build

# Set up Nginx
sudo cp frontend/dist /var/www/radflow
sudo nano /etc/nginx/sites-available/default
# Configure proxy to backend

# Start services with PM2
npm i -g pm2
pm2 start server.js
pm2 save
pm2 startup

# Enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Option 3: DigitalOcean App Platform

```bash
# 1. Push code to GitHub
# 2. Create new App in DigitalOcean
# 3. Connect GitHub repository
# 4. Create PostgreSQL database
# 5. Add environment variables:
#    - DB_HOST
#    - DB_PASSWORD
#    - JWT_SECRET
#    - EMAIL_USER
#    - EMAIL_PASS
# 6. Deploy

# Access at your-app.ondigitalocean.app
```

### Option 4: Railway (Simplest)

```bash
# 1. Push to GitHub
# 2. Sign up at railway.app
# 3. Create new project
# 4. Add PostgreSQL plugin
# 5. Add Node.js service
# 6. Connect GitHub repository
# 7. Add environment variables from .env
# 8. Deploy

# Get URL from Railway dashboard
```

### Option 5: Google Cloud Run

```bash
# Enable Cloud Run API
gcloud run deploy radflow-api \
  --source . \
  --region us-central1 \
  --set-env-vars "DB_HOST=your-cloud-sql-ip,DB_PASSWORD=your-password"

# Set Cloud SQL proxy
# Configure Cloud SQL IAM authentication
```

---

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure email service credentials
- [ ] Set up HTTPS/SSL certificate
- [ ] Enable CORS for your frontend domain
- [ ] Configure backup for PostgreSQL database
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up automated database backups
- [ ] Test email notifications
- [ ] Test push notifications
- [ ] Load test the application

---

## Environment Variables

### Backend (.env)

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=radflow
DB_USER=postgres
DB_PASSWORD=secure_password_here
DB_SSL=false

# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key

# Frontend
FRONTEND_URL=https://yourdomain.com

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Push Notifications
FCM_SERVER_KEY=your-fcm-key
```

### Frontend (.env)

```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## Database Backup & Restore

### Create Backup

```bash
# Local
pg_dump -U postgres radflow > backup.sql

# Docker
docker-compose exec postgres pg_dump -U postgres radflow > backup.sql

# Cloud (e.g., AWS RDS)
pg_dump -h rds-endpoint.amazonaws.com -U postgres radflow > backup.sql
```

### Restore Backup

```bash
psql -U postgres -d radflow < backup.sql
```

---

## Monitoring & Logging

### Server Logs
```bash
# Docker
docker-compose logs -f backend

# Direct
tail -f /var/log/application.log
```

### Database Monitoring
```bash
# Connect to database
psql -h localhost -U postgres -d radflow

# Check active connections
SELECT * FROM pg_stat_activity;

# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
```

---

## Scaling Considerations

1. **Database**: Use connection pooling (PgBouncer)
2. **Load Balancing**: Use Nginx or cloud load balancer
3. **Caching**: Implement Redis for frequently accessed data
4. **CDN**: Use Cloudflare for static assets
5. **Microservices**: Separate notifications into worker service

---

## Security Best Practices

1. **Secrets Management**
   - Use environment variables for all secrets
   - Never commit .env files
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL/TLS
   - Restrict IP access
   - Regular backups

3. **API Security**
   - Enable rate limiting
   - Use HTTPS only
   - Validate all inputs
   - Implement CORS properly
   - Add request logging

4. **Authentication**
   - Use strong password requirements
   - Implement password reset securely
   - Log authentication attempts
   - Monitor suspicious activity

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check environment variables
echo $DB_HOST
echo $DB_PASSWORD

# Verify credentials
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### Email Not Sending
- Verify email credentials
- Enable "Less secure apps" for Gmail
- Check spam folder
- Verify email service configuration

### Notifications Not Triggering
- Check notification cron jobs
- Verify database has correct data
- Check application logs

### High Memory Usage
- Check for memory leaks
- Implement connection pooling
- Monitor long-running queries

---

## Support & Help

- Check logs: `docker-compose logs -f`
- Test API: `curl http://localhost:5000/api/health`
- Test database: `psql -h localhost -U postgres -d radflow`

---

## License

MIT

## Contact

For issues or questions, contact your development team.
