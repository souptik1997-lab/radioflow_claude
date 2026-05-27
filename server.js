// ============================================================================
// RadFlow Backend Server
// Node.js/Express with PostgreSQL
// ============================================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control
const checkRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// ─── AUTHENTICATION ENDPOINTS ─────────────────────────────────────────────
app.post('/api/auth/register', checkRole('Coordinator'), async (req, res) => {
  try {
    const { email, full_name, role, password, department, phone } = req.body;
    
    if (!email || !full_name || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, full_name, password_hash, role, department, phone, created_by_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, full_name, role',
      [email, full_name, hashedPassword, role, department, phone, req.user.id]
    );

    if (role === 'Doctor') {
      await pool.query(
        'INSERT INTO consultants (user_id, name, specialization) VALUES ($1, $2, $3)',
        [result.rows[0].id, full_name, department]
      );
    }

    res.json({ 
      message: 'User created successfully',
      user: result.rows[0],
      temporary_password: password 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    
    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, result.rows[0].id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: 'RadFlow Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
    });

    res.json({ message: 'Reset link sent to email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP',
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── COORDINATOR ENDPOINTS ────────────────────────────────────────────────
app.get('/api/users', verifyToken, checkRole('Coordinator'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, department, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', verifyToken, checkRole('Coordinator'), async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/role', verifyToken, checkRole('Coordinator'), async (req, res) => {
  try {
    const { role } = req.body;
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATIENTS ENDPOINTS ───────────────────────────────────────────────────
app.post('/api/patients', verifyToken, async (req, res) => {
  try {
    const { patient_id, name, phone, diagnosis, date_first_visit, primary_consultant_id, payment_mode } = req.body;

    const result = await pool.query(
      'INSERT INTO patients (patient_id, name, phone, diagnosis, date_first_visit, primary_consultant_id, payment_mode, created_by_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [patient_id, name, phone, diagnosis, date_first_visit, primary_consultant_id, payment_mode, req.user.id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, patient_id, action, new_values) VALUES ($1, $2, $3, $4)',
      [req.user.id, result.rows[0].id, 'PATIENT_CREATED', JSON.stringify(result.rows[0])]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients', verifyToken, async (req, res) => {
  try {
    const { search, consultant_id, machine_type } = req.query;
    let query = `
      SELECT p.*, 
             c.name as primary_consultant_name,
             json_agg(json_build_object('id', pc.consultant_id, 'name', con.name, 'is_primary', pc.is_primary)) 
             FILTER (WHERE pc.consultant_id IS NOT NULL) as consultants
      FROM patients p
      LEFT JOIN consultants c ON p.primary_consultant_id = c.id
      LEFT JOIN patient_consultants pc ON p.id = pc.patient_id
      LEFT JOIN consultants con ON pc.consultant_id = con.id
      WHERE p.is_cancelled = false
    `;
    const params = [];

    if (search) {
      query += ` AND (p.name ILIKE $1 OR p.patient_id ILIKE $1)`;
      params.push(`%${search}%`);
    }
    if (consultant_id) {
      query += ` AND (p.primary_consultant_id = $${params.length + 1} OR pc.consultant_id = $${params.length + 1})`;
      params.push(consultant_id);
    }
    if (machine_type) {
      query += ` AND p.machine_type = $${params.length + 1}`;
      params.push(machine_type);
    }

    query += ` GROUP BY p.id, c.id ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
              c.name as primary_consultant_name,
              json_agg(json_build_object('id', pc.consultant_id, 'name', con.name, 'is_primary', pc.is_primary)) 
              FILTER (WHERE pc.consultant_id IS NOT NULL) as consultants
       FROM patients p
       LEFT JOIN consultants c ON p.primary_consultant_id = c.id
       LEFT JOIN patient_consultants pc ON p.id = pc.patient_id
       LEFT JOIN consultants con ON pc.consultant_id = con.id
       WHERE p.id = $1
       GROUP BY p.id, c.id`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/patients/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedFields = {
      'Doctor': ['diagnosis', 'primary_consultant_id', 'payment_mode', 'contouring_done', 'planning_done', 'tentative_start_date', 'machine_type', 'pending_issue', 'is_cancelled', 'cancellation_reason'],
      'Physicist': ['planning_done', 'machine_type'],
      'RTT': ['date_simulation', 'treatment_started', 'date_treatment_started', 'machine_type'],
      'Coordinator': Object.keys(updates)
    };

    const userAllowedFields = allowedFields[req.user.role] || [];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (userAllowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(403).json({ error: 'No permission to update these fields' });
    }

    const setClauses = Object.keys(filteredUpdates)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const result = await pool.query(
      `UPDATE patients SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${Object.keys(filteredUpdates).length + 1} RETURNING *`,
      [...Object.values(filteredUpdates), id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, patient_id, action, old_values, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, id, 'PATIENT_UPDATED', JSON.stringify(updates), JSON.stringify(filteredUpdates)]
    );

    // Trigger notifications based on updates
    await triggerNotifications(id, filteredUpdates, req.user.id);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add consultant to patient
app.post('/api/patients/:id/consultants', verifyToken, async (req, res) => {
  try {
    const { consultant_id, is_primary } = req.body;
    const patient_id = req.params.id;

    if (is_primary) {
      await pool.query('UPDATE patient_consultants SET is_primary = false WHERE patient_id = $1', [patient_id]);
    }

    const result = await pool.query(
      'INSERT INTO patient_consultants (patient_id, consultant_id, is_primary) VALUES ($1, $2, $3) ON CONFLICT (patient_id, consultant_id) DO UPDATE SET is_primary = $3 RETURNING *',
      [patient_id, consultant_id, is_primary || false]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONSULTANTS ENDPOINTS ────────────────────────────────────────────────
app.get('/api/consultants', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, u.email, u.full_name FROM consultants c LEFT JOIN users u ON c.user_id = u.id WHERE c.is_active = true ORDER BY c.name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── NOTIFICATIONS ENDPOINTS ──────────────────────────────────────────────
app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EXPORT ENDPOINTS ─────────────────────────────────────────────────────
app.post('/api/export/patients', verifyToken, async (req, res) => {
  try {
    const { filters } = req.body;
    let query = `
      SELECT p.patient_id, p.name, p.phone, p.diagnosis, p.date_first_visit,
             c.name as consultant_name, p.date_simulation, p.treatment_started,
             p.date_treatment_started, p.machine_type, p.contouring_done, 
             p.planning_done, p.pending_issue
      FROM patients p
      LEFT JOIN consultants c ON p.primary_consultant_id = c.id
      WHERE p.is_cancelled = false
    `;
    const params = [];

    if (filters?.consultant_id) {
      query += ` AND p.primary_consultant_id = $${params.length + 1}`;
      params.push(filters.consultant_id);
    }
    if (filters?.machine_type) {
      query += ` AND p.machine_type = $${params.length + 1}`;
      params.push(filters.machine_type);
    }
    if (filters?.started_only) {
      query += ` AND p.treatment_started = true`;
    }

    const result = await pool.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Patients');

    worksheet.columns = [
      { header: 'Patient ID', key: 'patient_id', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Diagnosis', key: 'diagnosis', width: 30 },
      { header: 'First Visit', key: 'date_first_visit', width: 15 },
      { header: 'Consultant', key: 'consultant_name', width: 20 },
      { header: 'Simulation Date', key: 'date_simulation', width: 15 },
      { header: 'Contouring Done', key: 'contouring_done', width: 12 },
      { header: 'Planning Done', key: 'planning_done', width: 12 },
      { header: 'Treatment Started', key: 'treatment_started', width: 15 },
      { header: 'Start Date', key: 'date_treatment_started', width: 15 },
      { header: 'Machine', key: 'machine_type', width: 12 },
      { header: 'Issues', key: 'pending_issue', width: 30 }
    ];

    result.rows.forEach(row => {
      worksheet.addRow(row);
    });

    const filename = `RadFlow_Export_${new Date().toISOString().slice(0,10)}.xlsx`;
    const filepath = path.join(__dirname, 'exports', filename);
    
    if (!fs.existsSync(path.join(__dirname, 'exports'))) {
      fs.mkdirSync(path.join(__dirname, 'exports'), { recursive: true });
    }

    await workbook.xlsx.writeFile(filepath);

    // Log export
    await pool.query(
      'INSERT INTO exports (user_id, export_type, filters, filename, file_path, record_count) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, 'PATIENTS', JSON.stringify(filters), filename, filepath, result.rows.length]
    );

    res.download(filepath, filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUSH NOTIFICATION TOKEN ──────────────────────────────────────────────
app.post('/api/notifications/register-token', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    await pool.query('UPDATE users SET push_notification_token = $1 WHERE id = $2', [token, req.user.id]);
    res.json({ message: 'Token registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HELPERS ──────────────────────────────────────────────────────────────
async function triggerNotifications(patientId, updates, userId) {
  try {
    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);
    if (!patient.rows.length) return;

    const p = patient.rows[0];

    // Simulation completed -> Notify physicists
    if (updates.date_simulation) {
      const physicists = await pool.query('SELECT * FROM users WHERE role = $1 AND is_active = true', ['Physicist']);
      for (const physicist of physicists.rows) {
        await createNotification(
          physicist.id,
          `Patient Simulated`,
          `${p.name} (${p.patient_id}) has been simulated. Ready for planning.`,
          'simulation',
          patientId
        );
      }
    }

    // Contouring completed -> Notify doctors
    if (updates.contouring_done === true) {
      const doctors = await pool.query('SELECT u.* FROM users u LEFT JOIN consultants c ON u.id = c.user_id WHERE u.role = $1 AND u.is_active = true', ['Doctor']);
      for (const doctor of doctors.rows) {
        await createNotification(
          doctor.id,
          `Patient Contoured`,
          `${p.name} (${p.patient_id}) contouring is complete.`,
          'contouring',
          patientId
        );
      }
    }

    // Planning completed -> Notify assigned doctors
    if (updates.planning_done === true) {
      const consultantResult = await pool.query('SELECT u.id FROM users u LEFT JOIN consultants c ON u.id = c.user_id WHERE c.id = $1', [p.primary_consultant_id]);
      if (consultantResult.rows.length) {
        await createNotification(
          consultantResult.rows[0].id,
          `Patient Ready for Treatment`,
          `${p.name} (${p.patient_id}) is ready for treatment planning.`,
          'planning',
          patientId
        );
      }
    }

    // Treatment started
    if (updates.treatment_started === true) {
      const consultantResult = await pool.query('SELECT u.id FROM users u LEFT JOIN consultants c ON u.id = c.user_id WHERE c.id = $1', [p.primary_consultant_id]);
      if (consultantResult.rows.length) {
        await createNotification(
          consultantResult.rows[0].id,
          `Treatment Started`,
          `${p.name} (${p.patient_id}) treatment has started.`,
          'treatment_started',
          patientId
        );
      }
    }
  } catch (err) {
    console.error('Error triggering notifications:', err);
  }
}

async function createNotification(userId, title, message, type, patientId) {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, patient_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, title, message, type, patientId]
    );
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

// ─── CRON JOBS FOR AUTOMATED NOTIFICATIONS ────────────────────────────────
// Check for patients not started within 4 days of simulation
cron.schedule('0 8 * * *', async () => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.user_id FROM patients p
       LEFT JOIN consultants c ON p.primary_consultant_id = c.id
       WHERE p.date_simulation IS NOT NULL 
       AND p.treatment_started = false 
       AND p.date_simulation::timestamp < CURRENT_TIMESTAMP - INTERVAL '4 days'
       AND p.is_cancelled = false`
    );

    for (const patient of result.rows) {
      if (patient.user_id) {
        await createNotification(
          patient.user_id,
          `⚠ Warning: Treatment Delayed`,
          `${patient.name} (${patient.patient_id}) has not started treatment within 4 days of simulation.`,
          'warning_delayed',
          patient.id
        );
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// Check for patients not completed planning within 1 day of simulation
cron.schedule('0 10 * * *', async () => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.id FROM patients p
       LEFT JOIN consultants c ON p.primary_consultant_id = c.id
       LEFT JOIN users u ON u.role = 'Physicist'
       WHERE p.date_simulation IS NOT NULL 
       AND p.planning_done = false 
       AND p.date_simulation::timestamp < CURRENT_TIMESTAMP - INTERVAL '1 day'
       AND p.is_cancelled = false`
    );

    for (const patient of result.rows) {
      await createNotification(
        patient.id,
        `⚠ Planning Pending`,
        `${patient.name} (${patient.patient_id}) planning should be completed within 1 day of simulation.`,
        'warning_planning',
        patient.id
      );
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// ─── SERVER STARTUP ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`RadFlow server running on port ${PORT}`);
});

module.exports = app;
