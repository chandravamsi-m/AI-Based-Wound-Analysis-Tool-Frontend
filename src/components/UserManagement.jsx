import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Trash2, Edit, ShieldCheck, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import './UserManagement.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function UserManagement() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Doctor',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const itemsPerPage = 5;

  // Fetch data from API
  useEffect(() => {
    fetchStaff();
  }, []);

  // Helper function to get initials from name (3 letters as per design)
  const getInitials = (name) => {
    if (!name) return '???';
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length >= 3) {
      return (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase();
    } else if (parts.length === 2) {
      return (parts[0][0] + parts[0][1] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 3).toUpperCase();
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setStaffData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const staffMember = staffData.find(s => s.id === id);
    if (!staffMember) return;

    const updatedData = {
      isActive: !staffMember.isActive,
      status: !staffMember.isActive ? 'ACTIVE' : 'DISABLED'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedStaff = await response.json();

      setStaffData(prevData =>
        prevData.map(staff => staff.id === id ? updatedStaff : staff)
      );
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userToDelete.id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setStaffData(prevData => prevData.filter(user => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);

      // Reset page if current page becomes empty
      const newFilteredCount = filteredData.length - 1;
      if (startIndex >= newFilteredCount && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Modal handlers for Add/Edit User
  const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Doctor',
      status: 'ACTIVE'
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',  // Don't prefill password for security
      confirmPassword: '',
      role: user.role,
      status: user.status
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleModalClose = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Doctor',
      status: 'ACTIVE'
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation (required for add mode, optional for edit)
    if (modalMode === 'add') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else {
        if (formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
          errors.password = 'Password must contain an uppercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
          errors.password = 'Password must contain a number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
          errors.password = 'Password must contain a special character';
        }
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      // If password is provided in edit mode, validate it
      if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain an uppercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Password must contain a number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        errors.password = 'Password must contain a special character';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const url = modalMode === 'add'
        ? `${API_BASE_URL}/users/`
        : `${API_BASE_URL}/users/${selectedUser.id}/`;

      const method = modalMode === 'add' ? 'POST' : 'PUT';

      // Prepare payload - exclude confirmPassword and only include password if provided
      const { confirmPassword, ...payload } = formData;
      if (!payload.password) {
        delete payload.password; // Don't send empty password on edit
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle backend validation errors
        if (errorData.password) {
          setFormErrors({ password: errorData.password[0] });
          return;
        }
        if (errorData.email) {
          setFormErrors({ email: errorData.email[0] });
          return;
        }
        throw new Error(`Failed to ${modalMode} user`);
      }

      const savedUser = await response.json();

      if (modalMode === 'add') {
        setStaffData(prevData => [...prevData, savedUser]);
      } else {
        setStaffData(prevData =>
          prevData.map(user => user.id === selectedUser.id ? savedUser : user)
        );
      }

      handleModalClose();
    } catch (err) {
      alert(`Error ${modalMode === 'add' ? 'adding' : 'updating'} user: ${err.message}`);
    }
  };

  // Filter and search logic
  const filteredData = useMemo(() => {
    return staffData.filter(staff => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'All Roles' || staff.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staffData, searchTerm, roleFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Count active staff
  const activeStaffCount = staffData.filter(staff => staff.isActive).length;

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="user-management">
      {/* Header Section */}
      <div className="um-header">
        {/* <div className="um-breadcrumb">
          VIEWING AS: ADMIN <span className="um-switch">(Switch)</span>
        </div> */}

        <div className="um-header-main">
          <div className="um-header-left">
            <h1 className="um-title">User Management</h1>
            <p className="um-subtitle">Manage staff access, security status, and clinical permissions.</p>
          </div>

          <div className="um-header-right">
            {/* <button className="um-btn-secondary">
              <ShieldCheck size={16} />
              Audit
            </button> */}
            <button className="um-btn-primary" onClick={handleAddUser}>
              <UserPlus size={16} />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="um-card">
        {/* Search and Filter Bar */}
        <div className="um-toolbar">
          <div className="um-toolbar-left">
            <div className="um-search">
              <Search size={16} className="um-search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="um-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="um-filter">
              <Filter size={16} className="um-filter-icon" />
              <select
                className="um-filter-select"
                value={roleFilter}
                onChange={handleRoleFilterChange}
              >
                <option>All Roles</option>
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
          <div className="um-toolbar-right">
            <span className="um-online-indicator">
              <span className="um-online-dot"></span>
              {activeStaffCount} Staff Online
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="um-table">
          {/* Table Header */}
          <div className="um-table-header">
            <div className="um-th um-col-staff">Staff Member</div>
            <div className="um-th um-col-status">Status</div>
            <div className="um-th um-col-role">Role</div>
            <div className="um-th um-col-activity">Activity</div>
            <div className="um-th um-col-actions">Actions</div>
          </div>

          {/* Table Body */}
          <div className="um-table-body">
            {loading ? (
              <div className="um-loading">
                <Loader2 size={32} className="um-spinner" />
                <span>Loading staff records...</span>
              </div>
            ) : error ? (
              <div className="um-error">
                <p>Error: {error}</p>
                <button onClick={fetchStaff} className="um-btn-retry">Retry</button>
              </div>
            ) : currentData.length === 0 ? (
              <div className="um-empty">
                No staff members found matching your criteria.
              </div>
            ) : (
              currentData.map((staff) => (
                <div key={staff.id} className="um-table-row">
                  {/* Staff Member */}
                  <div className="um-td um-col-staff">
                    <div className="um-staff-cell">
                      <div className={`um-avatar ${!staff.isActive ? 'um-avatar-disabled' : ''}`}>
                        {getInitials(staff.name)}
                      </div>
                      <div className="um-staff-info">
                        <div className="um-staff-name">{staff.name}</div>
                        <div className="um-staff-email">{staff.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="um-td um-col-status">
                    <div className="um-status-cell">
                      <label className="um-toggle">
                        <input
                          type="checkbox"
                          checked={staff.isActive}
                          onChange={() => handleToggleStatus(staff.id)}
                        />
                        <span className="um-toggle-slider"></span>
                      </label>
                      <span className={`um-status-label ${staff.isActive ? 'um-status-active' : 'um-status-disabled'}`}>
                        {staff.status}
                      </span>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="um-td um-col-role">
                    <span className="um-role-badge">{staff.role}</span>
                  </div>

                  {/* Activity */}
                  <div className="um-td um-col-activity">
                    <span className="um-activity-text">{staff.activity}</span>
                  </div>

                  {/* Actions */}
                  <div className="um-td um-col-actions">
                    <div className="um-actions">
                      <button
                        className="um-action-btn um-action-btn-edit"
                        title="Edit"
                        onClick={() => handleEditUser(staff)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="um-action-btn um-action-btn-delete"
                        title="Delete"
                        onClick={() => openDeleteModal(staff)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="um-footer">
          <div className="um-footer-notice">
            SYSTEM GOVERNANCE: CHANGES IMPACT BILLING & AUDIT LOGS
          </div>
          <div className="um-pagination">
            <button
              className="um-pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="um-pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="um-modal-overlay">
          <div className="um-user-modal">
            <div className="um-user-modal-header">
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button className="um-modal-close" onClick={handleModalClose}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="um-user-modal-body">
                <div className="um-form-group">
                  <label className="um-form-label">Name <span className="um-required-star">*</span></label>
                  <input
                    type="text"
                    className={`um-form-input ${formErrors.name ? 'um-form-input-error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && <span className="um-form-error">{formErrors.name}</span>}
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">Email <span className="um-required-star">*</span></label>
                  <input
                    type="email"
                    className={`um-form-input ${formErrors.email ? 'um-form-input-error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && <span className="um-form-error">{formErrors.email}</span>}
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">
                    Password {modalMode === 'add' ? <span className="um-required-star">*</span> : '(leave blank to keep current)'}
                  </label>
                  <div className="um-password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`um-form-input ${formErrors.password ? 'um-form-input-error' : ''}`}
                      value={formData.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      placeholder={modalMode === 'add' ? 'Enter password' : 'Enter new password (optional)'}
                    />
                    <button
                      type="button"
                      className="um-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && <span className="um-form-error">{formErrors.password}</span>}
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">
                    Confirm Password {modalMode === 'add' ? <span className="um-required-star">*</span> : ''}
                  </label>
                  <div className="um-password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`um-form-input ${formErrors.confirmPassword ? 'um-form-input-error' : ''}`}
                      value={formData.confirmPassword}
                      onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="um-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <span className="um-form-error">{formErrors.confirmPassword}</span>}
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">Role <span className="um-required-star">*</span></label>
                  <select
                    className="um-form-select"
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">Status <span className="um-required-star">*</span></label>
                  <select
                    className="um-form-select"
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="um-user-modal-footer">
                <button type="button" className="um-btn-cancel-modal" onClick={handleModalClose}>
                  Cancel
                </button>
                <button type="submit" className="um-btn-save">
                  {modalMode === 'add' ? 'Add User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="um-modal-overlay">
          <div className="um-modal-content">
            <div className="um-modal-header">
              <div className="um-modal-icon-container">
                <Trash2 size={24} className="um-modal-icon" />
              </div>
              <h2 className="um-modal-title">Delete User</h2>
            </div>
            <div className="um-modal-body">
              <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
              <p className="um-modal-warning">This action cannot be undone and will permanently remove this user from the system.</p>
            </div>
            <div className="um-modal-footer">
              <button
                className="um-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="um-btn-delete-confirm"
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
