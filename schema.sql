-- ============================================================================
-- RadFlow: Radiation Department Patient Management System
-- PostgreSQL Database Schema
-- ============================================================================

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Coordinator', 'Doctor', 'Physicist', 'RTT')),
  department VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by_id INTEGER REFERENCES users(id),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  push_notification_token VARCHAR(500),
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'
);

-- Consultants table
CREATE TABLE consultants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  contact_number VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  diagnosis VARCHAR(500),
  date_first_visit DATE,
  primary_consultant_id INTEGER REFERENCES consultants(id),
  payment_mode VARCHAR(100),
  date_simulation DATE,
  date_simulation_scheduled DATE,
  contouring_done BOOLEAN DEFAULT FALSE,
  date_contouring DATE,
  planning_done BOOLEAN DEFAULT FALSE,
  date_planning DATE,
  tentative_start_date DATE,
  treatment_started BOOLEAN DEFAULT FALSE,
  date_treatment_started DATE,
  machine_type VARCHAR(50),
  pending_issue TEXT,
  issue_raised_date TIMESTAMP,
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  cancellation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_id INTEGER REFERENCES users(id)
);

-- Patient-Consultant Association (multiple consultants per patient)
CREATE TABLE patient_consultants (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultant_id INTEGER NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id, consultant_id)
);

-- Notification history
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  patient_id INTEGER REFERENCES patients(id),
  related_data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Activity log for audit trail
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  patient_id INTEGER REFERENCES patients(id),
  action VARCHAR(255) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Export history
CREATE TABLE exports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  export_type VARCHAR(100),
  filters JSONB,
  filename VARCHAR(255),
  file_path VARCHAR(500),
  record_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_primary_consultant ON patients(primary_consultant_id);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_patient_id ON activity_logs(patient_id);
CREATE INDEX idx_patient_consultants_patient ON patient_consultants(patient_id);
CREATE INDEX idx_patient_consultants_consultant ON patient_consultants(consultant_id);

-- Initial data (optional)
-- Insert default payment modes as a system constant table
CREATE TABLE system_constants (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_constants (key, value) VALUES
  ('payment_modes', 'Cash,Swasthya Sathi,Ayushman,WBUHS,Railway,ESI,ECL'),
  ('machine_types', 'Elekta,Tomo'),
  ('user_roles', 'Coordinator,Doctor,Physicist,RTT');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for patients table
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
