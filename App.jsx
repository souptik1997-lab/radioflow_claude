// App.jsx - Main React Application
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import SettingsPage from './pages/SettingsPage';
import UsersManagementPage from './pages/UsersManagementPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// API Configuration
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch initial notifications
      fetchNotifications();
      
      // Set up notification polling
      const notificationInterval = setInterval(fetchNotifications, 30000); // Every 30 seconds
      return () => clearInterval(notificationInterval);
    }
    
    setLoading(false);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchNotifications();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <div className="loading-screen">Loading RadFlow...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route element={<ProtectedRoute user={user} />}>
          <Route
            path="/*"
            element={
              <div className="app-container">
                <Navbar user={user} notifications={notifications} onLogout={handleLogout} />
                <div className="app-content">
                  <Sidebar user={user} />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<DashboardPage user={user} />} />
                      <Route path="/patients" element={<PatientsPage user={user} />} />
                      <Route path="/patients/:id" element={<PatientDetailPage user={user} />} />
                      <Route path="/settings" element={<SettingsPage user={user} />} />
                      {user?.role === 'Coordinator' && (
                        <Route path="/users" element={<UsersManagementPage />} />
                      )}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

// ─────────────────────────────────────────────────────────────────────────

// pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showCoordinatorSecret, setShowCoordinatorSecret] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      onLogin(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/forgot-password', { email: forgotEmail });
      alert('Reset link sent to your email');
      setShowForgot(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error sending reset link');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>RadFlow</h1>
            <p>Radiation Department Patient Management</p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                className="btn-text"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>

              <button
                type="button"
                className="btn-text text-small"
                onClick={() => setShowCoordinatorSecret(!showCoordinatorSecret)}
              >
                {showCoordinatorSecret ? '↓' : '→'} Coordinator access
              </button>

              {showCoordinatorSecret && (
                <div className="coordinator-notice">
                  If you are a Coordinator and cannot access, use the hidden dashboard link:
                  <code>/coordinator-dashboard?reset=true</code>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <p className="form-help">Enter your email to receive a password reset link</p>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn btn-primary">
                Send Reset Link
              </button>

              <button
                type="button"
                className="btn-text"
                onClick={() => setShowForgot(false)}
              >
                Back to login
              </button>
            </form>
          )}
        </div>

        <div className="login-info">
          <h3>Welcome to RadFlow</h3>
          <p>Streamline your radiation department's patient management with real-time updates, role-based access, and comprehensive patient tracking.</p>
          <ul>
            <li>✓ Multi-user collaboration</li>
            <li>✓ Role-based access control</li>
            <li>✓ Real-time notifications</li>
            <li>✓ Excel exports</li>
            <li>✓ Automated alerts</li>
            <li>✓ Secure authentication</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// ─────────────────────────────────────────────────────────────────────────

// pages/PatientsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddPatientModal from '../components/AddPatientModal';
import PatientList from '../components/PatientList';
import ExportModal from '../components/ExportModal';
import '../styles/PatientsPage.css';

const PatientsPage = ({ user }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchConsultants();
  }, [search, selectedConsultant, selectedMachine]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedConsultant) params.consultant_id = selectedConsultant;
      if (selectedMachine) params.machine_type = selectedMachine;

      const response = await axios.get('/patients', { params });
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await axios.get('/consultants');
      setConsultants(response.data);
    } catch (err) {
      console.error('Error fetching consultants:', err);
    }
  };

  const handlePatientAdded = () => {
    setShowAddModal(false);
    fetchPatients();
  };

  const handleExport = async (filters) => {
    try {
      await axios.post('/export/patients', { filters }, { responseType: 'blob' });
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  return (
    <div className="patients-page">
      <div className="page-header">
        <h1>Patient Management</h1>
        <p>Total: {patients.length} patients</p>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search by name or patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={selectedConsultant} onChange={(e) => setSelectedConsultant(e.target.value)}>
          <option value="">All Consultants</option>
          {consultants.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)}>
          <option value="">All Machines</option>
          <option value="Elekta">Elekta</option>
          <option value="Tomo">Tomo</option>
        </select>

        <div className="action-buttons">
          {(user.role === 'Coordinator' || user.role === 'Doctor') && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Add Patient
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setShowExportModal(true)}>
            ↓ Export to Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : (
        <PatientList patients={patients} user={user} />
      )}

      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onPatientAdded={handlePatientAdded}
          consultants={consultants}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          consultants={consultants}
        />
      )}
    </div>
  );
};

export default PatientsPage;

// ─────────────────────────────────────────────────────────────────────────

// pages/PatientDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientForm from '../components/PatientForm';
import '../styles/PatientDetailPage.css';

const PatientDetailPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultants, setConsultants] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatient();
    fetchConsultants();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await axios.get(`/patients/${id}`);
      setPatient(response.data);
    } catch (err) {
      console.error('Error fetching patient:', err);
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await axios.get('/consultants');
      setConsultants(response.data);
    } catch (err) {
      console.error('Error fetching consultants:', err);
    }
  };

  const handleSave = async (updatedData) => {
    try {
      setSaving(true);
      const response = await axios.put(`/patients/${id}`, updatedData);
      setPatient(response.data);
      alert('Patient updated successfully');
    } catch (err) {
      alert('Error updating patient: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddConsultant = async (consultantId, isPrimary) => {
    try {
      await axios.post(`/patients/${id}/consultants`, {
        consultant_id: consultantId,
        is_primary: isPrimary
      });
      fetchPatient();
    } catch (err) {
      console.error('Error adding consultant:', err);
    }
  };

  if (loading) return <div className="loading">Loading patient...</div>;
  if (!patient) return <div className="error">Patient not found</div>;

  return (
    <div className="patient-detail-page">
      <button className="btn btn-secondary" onClick={() => navigate('/patients')}>
        ← Back to Patients
      </button>

      <PatientForm
        patient={patient}
        consultants={consultants}
        user={user}
        onSave={handleSave}
        onAddConsultant={handleAddConsultant}
        saving={saving}
      />
    </div>
  );
};

export default PatientDetailPage;

// ─────────────────────────────────────────────────────────────────────────

// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import NotificationCenter from '../components/NotificationCenter';
import '../styles/DashboardPage.css';

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch patients to calculate stats
      const patientsRes = await axios.get('/patients');
      const patients = patientsRes.data;

      const total = patients.length;
      const started = patients.filter(p => p.treatment_started).length;
      const simulated = patients.filter(p => p.date_simulation && !p.treatment_started).length;
      const withIssues = patients.filter(p => p.pending_issue && p.pending_issue.trim()).length;
      const cancelled = patients.filter(p => p.is_cancelled).length;

      setStats({ total, started, simulated, withIssues, cancelled });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h1>Welcome back, {user.full_name}</h1>
        <p className="role-badge">{user.role}</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Patients" value={stats.total} color="primary" />
          <StatCard label="Treatment Started" value={stats.started} color="success" />
          <StatCard label="Simulated" value={stats.simulated} color="warning" />
          <StatCard label="With Issues" value={stats.withIssues} color="danger" />
          <StatCard label="Cancelled" value={stats.cancelled} color="secondary" />
        </div>
      )}

      <div className="dashboard-content">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default DashboardPage;

// ─────────────────────────────────────────────────────────────────────────

// pages/UsersManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddUserModal from '../components/AddUserModal';
import UsersList from '../components/UsersList';
import '../styles/UsersManagementPage.css';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = () => {
    setShowAddModal(false);
    fetchUsers();
  };

  return (
    <div className="users-management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <UsersList users={users} onUsersUpdated={fetchUsers} />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;

// ─────────────────────────────────────────────────────────────────────────

// pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-container">
        <h1>Reset Your Password</h1>

        {success ? (
          <div className="success-message">
            ✓ Password reset successfully. Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

// ─────────────────────────────────────────────────────────────────────────

// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
