// components/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PatientForm.css';

const PatientForm = ({ patient, consultants, user, onSave, onAddConsultant, saving }) => {
  const [formData, setFormData] = useState(patient);
  const [selectedConsultantId, setSelectedConsultantId] = useState('');
  const [selectedAsPrimary, setSelectedAsPrimary] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);

  const canEdit = (field) => {
    const rolePermissions = {
      'Coordinator': true,
      'Doctor': ['diagnosis', 'primary_consultant_id', 'payment_mode', 'contouring_done', 'planning_done', 'tentative_start_date', 'machine_type', 'pending_issue', 'is_cancelled', 'cancellation_reason'].includes(field),
      'Physicist': ['planning_done', 'machine_type'].includes(field),
      'RTT': ['date_simulation', 'treatment_started', 'date_treatment_started', 'machine_type'].includes(field)
    };
    return rolePermissions[user.role];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    const changedFields = {};
    Object.keys(formData).forEach(key => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(patient[key])) {
        changedFields[key] = formData[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      alert('No changes made');
      return;
    }

    await onSave(changedFields);
  };

  const handleAddConsultant = async () => {
    if (!selectedConsultantId) return;
    await onAddConsultant(selectedConsultantId, selectedAsPrimary);
    setSelectedConsultantId('');
    setSelectedAsPrimary(false);
  };

  const handleCancelTreatment = async () => {
    if (!cancellationReason.trim()) {
      alert('Please enter a reason for cancellation');
      return;
    }
    await onSave({
      is_cancelled: true,
      cancellation_reason: cancellationReason
    });
    setShowCancelModal(false);
  };

  const getPatientStatus = () => {
    if (formData.is_cancelled) return 'cancelled';
    if (formData.pending_issue?.trim()) return 'issue';
    if (formData.treatment_started) return 'started';
    if (formData.date_simulation) return 'simulated';
    return 'normal';
  };

  const status = getPatientStatus();

  return (
    <div className="patient-form-container">
      <div className="patient-header">
        <div className="header-info">
          <h1>{formData.name}</h1>
          <p className="patient-id">{formData.patient_id}</p>
          <div className={`status-badge status-${status}`}>
            {status === 'cancelled' && '⊘ Cancelled'}
            {status === 'issue' && '⚠ Has Issue'}
            {status === 'started' && '✓ Started'}
            {status === 'simulated' && '→ Simulated'}
            {status === 'normal' && '○ Pending'}
          </div>
        </div>
        <div className="header-actions">
          {!formData.is_cancelled && (
            <button
              className="btn btn-danger"
              onClick={() => setShowCancelModal(true)}
            >
              ⊘ Cancel Treatment
            </button>
          )}
        </div>
      </div>

      {formData.is_cancelled && (
        <div className="cancellation-banner">
          <strong>Treatment Cancelled:</strong> {formData.cancellation_reason}
        </div>
      )}

      {formData.pending_issue && formData.pending_issue.trim() && (
        <div className="issue-banner">
          <strong>⚠ Pending Issue:</strong> {formData.pending_issue}
          {canEdit('pending_issue') && (
            <button
              className="btn btn-sm"
              onClick={() => setShowIssueModal(true)}
            >
              Update
            </button>
          )}
        </div>
      )}

      <form className="patient-form">
        <section className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!canEdit('name')}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={!canEdit('phone')}
              />
            </div>
            <div className="form-group full">
              <label>Diagnosis</label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis || ''}
                onChange={handleChange}
                disabled={!canEdit('diagnosis')}
              />
            </div>
            <div className="form-group">
              <label>Date of First Visit</label>
              <input
                type="date"
                name="date_first_visit"
                value={formData.date_first_visit || ''}
                onChange={handleChange}
                disabled={!canEdit('date_first_visit')}
              />
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select
                name="payment_mode"
                value={formData.payment_mode || ''}
                onChange={handleChange}
                disabled={!canEdit('payment_mode')}
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Swasthya Sathi">Swasthya Sathi</option>
                <option value="Ayushman">Ayushman</option>
                <option value="WBUHS">WBUHS</option>
                <option value="Railway">Railway</option>
                <option value="ESI">ESI</option>
                <option value="ECL">ECL</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Consultants</h2>
          <div className="consultants-list">
            {formData.consultants?.map(pc => (
              <div key={pc.id} className={`consultant-tag ${pc.is_primary ? 'primary' : ''}`}>
                {pc.name}
                {pc.is_primary && <span className="badge">Primary</span>}
              </div>
            ))}
          </div>
          {canEdit('primary_consultant_id') && (
            <div className="add-consultant">
              <select
                value={selectedConsultantId}
                onChange={(e) => setSelectedConsultantId(e.target.value)}
              >
                <option value="">Add Consultant...</option>
                {consultants.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedAsPrimary}
                  onChange={(e) => setSelectedAsPrimary(e.target.checked)}
                />
                Set as Primary
              </label>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleAddConsultant}
                disabled={!selectedConsultantId}
              >
                Add
              </button>
            </div>
          )}
        </section>

        <section className="form-section">
          <h2>Simulation & Planning</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Date of Simulation</label>
              <input
                type="date"
                name="date_simulation"
                value={formData.date_simulation || ''}
                onChange={handleChange}
                disabled={!canEdit('date_simulation')}
              />
            </div>
            <div className="form-group">
              <label>Contouring Done</label>
              <select
                name="contouring_done"
                value={formData.contouring_done ? 'Yes' : 'No'}
                onChange={(e) => handleChange({ target: { name: 'contouring_done', value: e.target.value === 'Yes', type: 'checkbox' } })}
                disabled={!canEdit('contouring_done')}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Planning Done</label>
              <select
                name="planning_done"
                value={formData.planning_done ? 'Yes' : 'No'}
                onChange={(e) => handleChange({ target: { name: 'planning_done', value: e.target.value === 'Yes', type: 'checkbox' } })}
                disabled={!canEdit('planning_done')}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tentative Start Date</label>
              <input
                type="date"
                name="tentative_start_date"
                value={formData.tentative_start_date || ''}
                onChange={handleChange}
                disabled={!canEdit('tentative_start_date')}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Treatment</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Treatment Started</label>
              <select
                name="treatment_started"
                value={formData.treatment_started ? 'Yes' : 'No'}
                onChange={(e) => handleChange({ target: { name: 'treatment_started', value: e.target.value === 'Yes', type: 'checkbox' } })}
                disabled={!canEdit('treatment_started')}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date Treatment Started</label>
              <input
                type="date"
                name="date_treatment_started"
                value={formData.date_treatment_started || ''}
                onChange={handleChange}
                disabled={!canEdit('date_treatment_started')}
              />
            </div>
            <div className="form-group">
              <label>Machine Type</label>
              <select
                name="machine_type"
                value={formData.machine_type || ''}
                onChange={handleChange}
                disabled={!canEdit('machine_type')}
              >
                <option value="">Select Machine</option>
                <option value="Elekta">Elekta</option>
                <option value="Tomo">Tomo</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Issues & Notes</h2>
          <div className="form-group full">
            <label>Pending Issue</label>
            <textarea
              name="pending_issue"
              value={formData.pending_issue || ''}
              onChange={handleChange}
              disabled={!canEdit('pending_issue')}
              placeholder="Any pending issues or notes..."
            />
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || formData.is_cancelled}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Cancel Treatment</h2>
            <p>This action cannot be undone. Please provide a reason:</p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Reason for cancellation..."
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelTreatment}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;

// ─────────────────────────────────────────────────────────────────────────

// components/PatientList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientList.css';

const PatientList = ({ patients, user }) => {
  const navigate = useNavigate();

  const getStatusClass = (patient) => {
    if (patient.is_cancelled) return 'status-cancelled';
    if (patient.pending_issue?.trim()) return 'status-issue';
    if (patient.treatment_started) return 'status-started';
    if (patient.date_simulation) return 'status-simulated';
    return 'status-normal';
  };

  if (patients.length === 0) {
    return <div className="no-patients">No patients found</div>;
  }

  return (
    <div className="patient-list">
      <table className="patients-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Diagnosis</th>
            <th>Consultant</th>
            <th>Status</th>
            <th>Simulation Date</th>
            <th>Treatment</th>
            <th>Machine</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id} className={getStatusClass(patient)}>
              <td className="patient-id">{patient.patient_id}</td>
              <td className="patient-name">{patient.name}</td>
              <td className="diagnosis">{patient.diagnosis || '-'}</td>
              <td className="consultant">{patient.primary_consultant_name || '-'}</td>
              <td className="status">
                {patient.is_cancelled && '⊘ Cancelled'}
                {patient.pending_issue?.trim() && '⚠ Issue'}
                {patient.treatment_started && '✓ Started'}
                {!patient.is_cancelled && !patient.pending_issue?.trim() && patient.date_simulation && !patient.treatment_started && '→ Simulated'}
                {!patient.is_cancelled && !patient.pending_issue?.trim() && !patient.date_simulation && '○ Pending'}
              </td>
              <td>{patient.date_simulation || '-'}</td>
              <td>{patient.treatment_started ? 'Yes' : 'No'}</td>
              <td>{patient.machine_type || '-'}</td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;

// ─────────────────────────────────────────────────────────────────────────

// components/AddPatientModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Modal.css';

const AddPatientModal = ({ onClose, onPatientAdded, consultants }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    phone: '',
    diagnosis: '',
    date_first_visit: '',
    primary_consultant_id: '',
    payment_mode: 'Cash'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patient_id || !formData.name) {
      setError('Patient ID and Name are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/patients', formData);
      onPatientAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Patient</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient ID *</label>
            <input
              type="text"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              placeholder="RAD2024001"
              required
            />
          </div>

          <div className="form-group">
            <label>Patient Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 XXXXXXXXXX"
            />
          </div>

          <div className="form-group">
            <label>Diagnosis</label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Primary diagnosis"
            />
          </div>

          <div className="form-group">
            <label>Date of First Visit</label>
            <input
              type="date"
              name="date_first_visit"
              value={formData.date_first_visit}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Primary Consultant</label>
            <select
              name="primary_consultant_id"
              value={formData.primary_consultant_id}
              onChange={handleChange}
            >
              <option value="">Select Consultant</option>
              {consultants.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select
              name="payment_mode"
              value={formData.payment_mode}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="Swasthya Sathi">Swasthya Sathi</option>
              <option value="Ayushman">Ayushman</option>
              <option value="WBUHS">WBUHS</option>
              <option value="Railway">Railway</option>
              <option value="ESI">ESI</option>
              <option value="ECL">ECL</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;

// ─────────────────────────────────────────────────────────────────────────

// components/ExportModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Modal.css';

const ExportModal = ({ onClose, onExport, consultants }) => {
  const [filters, setFilters] = useState({
    consultant_id: '',
    machine_type: '',
    started_only: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/export/patients', { filters }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RadFlow_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
      onExport(filters);
    } catch (err) {
      setError(err.response?.data?.error || 'Error exporting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Export Patients</h2>

        <form onSubmit={handleExport}>
          <p className="form-help">Select filters for export</p>

          <div className="form-group">
            <label>Consultant</label>
            <select
              name="consultant_id"
              value={filters.consultant_id}
              onChange={handleChange}
            >
              <option value="">All Consultants</option>
              {consultants.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Machine Type</label>
            <select
              name="machine_type"
              value={filters.machine_type}
              onChange={handleChange}
            >
              <option value="">All Machines</option>
              <option value="Elekta">Elekta</option>
              <option value="Tomo">Tomo</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="started_only"
                checked={filters.started_only}
                onChange={handleChange}
              />
              Only patients with treatment started
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;

// ─────────────────────────────────────────────────────────────────────────

// components/AddUserModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Modal.css';

const AddUserModal = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'Doctor',
    department: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.full_name || !formData.password) {
      setError('Email, Name, and Password are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/auth/register', formData);
      setSuccess(true);
      setTimeout(() => {
        onUserAdded();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New User</h2>

        {success ? (
          <div className="success-message">✓ User created successfully</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@hospital.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Doctor">Doctor</option>
                <option value="Physicist">Physicist</option>
                <option value="RTT">RTT (Radiotherapy Technician)</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Radiation Oncology"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Temporary Password *</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Generate secure password"
                required
              />
              <small>User can change this on first login</small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddUserModal;

// ─────────────────────────────────────────────────────────────────────────

// components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, notifications, onLogout }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1>RadFlow</h1>
        </div>

        <div className="navbar-actions">
          <div className="notification-center">
            <button
              className={`notification-button ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">Notifications</div>
                <div className="notifications-list">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`}>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <small>{new Date(n.created_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
                <a href="/notifications" className="notifications-footer">View all</a>
              </div>
            )}
          </div>

          <div className="user-menu">
            <button className="user-button" onClick={() => setShowMenu(!showMenu)}>
              {user.full_name} ({user.role})
            </button>

            {showMenu && (
              <div className="menu-dropdown">
                <a href="/settings">Settings</a>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// ─────────────────────────────────────────────────────────────────────────

// components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/patients', label: 'Patients', icon: '👥' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ];

  if (user?.role === 'Coordinator') {
    menuItems.push({ path: '/users', label: 'User Management', icon: '👤' });
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="role-info">
          <strong>{user?.role}</strong>
          <small>{user?.email}</small>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

// ─────────────────────────────────────────────────────────────────────────

// components/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <div className="notification-center-page">
      <h2>Notifications</h2>
      <div className="notifications-grid">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notification-card ${n.type} ${n.is_read ? 'read' : 'unread'}`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className="notification-header">
                <h3>{n.title}</h3>
                {!n.is_read && <span className="unread-badge"></span>}
              </div>
              <p>{n.message}</p>
              <small>{new Date(n.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

// ─────────────────────────────────────────────────────────────────────────

// components/StatCard.jsx
import React from 'react';
import '../styles/StatCard.css';

const StatCard = ({ label, value, color = 'primary' }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatCard;

// ─────────────────────────────────────────────────────────────────────────

// components/UsersList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UsersList.css';

const UsersList = ({ users, onUsersUpdated }) => {
  const [loading, setLoading] = useState({});
  const [selectedRole, setSelectedRole] = useState({});

  const handleRoleChange = (userId, newRole) => {
    setSelectedRole({ ...selectedRole, [userId]: newRole });
  };

  const handleUpdateRole = async (userId) => {
    try {
      setLoading({ ...loading, [userId]: true });
      await axios.put(`/users/${userId}/role`, { role: selectedRole[userId] });
      onUsersUpdated();
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setLoading({ ...loading, [userId]: false });
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('Are you sure? This will deactivate the user.')) {
      try {
        await axios.delete(`/users/${userId}`);
        onUsersUpdated();
      } catch (err) {
        console.error('Error deactivating user:', err);
      }
    }
  };

  return (
    <div className="users-list">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={user.is_active ? '' : 'inactive'}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={selectedRole[user.id] || user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={!user.is_active}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Physicist">Physicist</option>
                  <option value="RTT">RTT</option>
                  <option value="Coordinator">Coordinator</option>
                </select>
              </td>
              <td>{user.department || '-'}</td>
              <td>{user.phone || '-'}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                {user.is_active ? (
                  <>
                    {selectedRole[user.id] && selectedRole[user.id] !== user.role && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateRole(user.id)}
                        disabled={loading[user.id]}
                      >
                        Save
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeactivate(user.id)}
                    >
                      Deactivate
                    </button>
                  </>
                ) : (
                  <span className="inactive-badge">Deactivated</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;

// ─────────────────────────────────────────────────────────────────────────

// components/SettingsPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/SettingsPage.css';

const SettingsPage = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      await axios.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-card">
        <h2>Account Information</h2>
        <div className="info-row">
          <label>Name:</label>
          <span>{user.full_name}</span>
        </div>
        <div className="info-row">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
        <div className="info-row">
          <label>Role:</label>
          <span>{user.role}</span>
        </div>
      </div>

      <div className="settings-card">
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

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
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
