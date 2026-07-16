import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Lock, Shield, Trash2, Edit3, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  
  // Profile update form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Admin users state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userListError, setUserListError] = useState('');

  // Fetch all users (Admin only)
  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    
    setLoadingUsers(true);
    setUserListError('');
    try {
      const { data } = await axios.get('http://localhost:5000/api/users');
      setUsersList(data);
    } catch (err) {
      setUserListError('Failed to load user directories.');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name || !email) {
      setFormError('Name and Email are required.');
      return;
    }

    setLoadingUpdate(true);
    try {
      const updatedData = { name, email };
      if (password) {
        if (password.length < 6) {
          setFormError('New password must be at least 6 characters.');
          setLoadingUpdate(false);
          return;
        }
        updatedData.password = password;
      }

      await updateProfile(updatedData);
      setFormSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Handle delete user (Self-delete or admin deleting others)
  const handleDeleteUser = async (id, userName) => {
    const isSelf = id === user?._id;
    const confirmMessage = isSelf
      ? "Are you absolutely sure you want to delete your account? This action is permanent and you will be logged out."
      : `Are you sure you want to delete ${userName}'s account?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        if (isSelf) {
          logout();
        } else {
          // Re-fetch users
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  // Get user avatar initials
  const getInitials = (n) => {
    if (!n) return '';
    return n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-wrapper" style={{ display: 'block' }}>
      <div className="dashboard-grid">
        
        {/* Left Side: Profile Panel */}
        <div className="profile-card glass-panel">
          <div className="avatar-container">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div className="profile-name">{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</div>
            <span className={`profile-role-badge role-${user?.role}`}>
              <Shield size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
              {user?.role}
            </span>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--glass-border)', margin: '1.5rem 0' }} />

          <h4 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Update Profile</h4>
          
          {formSuccess && (
            <div className="success-banner">
              <CheckCircle size={18} />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="error-banner">
              <AlertTriangle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="update-name">Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={16} /></span>
                <input
                  id="update-name"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="update-email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  id="update-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="update-password">New Password (Optional)</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="update-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter to change"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '0.75rem' }}
              disabled={loadingUpdate}
            >
              <Edit3 size={16} /> {loadingUpdate ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Self Delete Option for regular user */}
          {user?.role !== 'admin' && (
            <button
              onClick={() => handleDeleteUser(user?._id, user?.name)}
              className="btn btn-secondary"
              style={{ width: '100%', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'transparent', marginBottom: '0.75rem' }}
            >
              <Trash2 size={16} /> Delete Account
            </button>
          )}

          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>

        {/* Right Side: Main Management Panel */}
        <div className="management-panel glass-panel">
          {user?.role === 'admin' ? (
            <>
              <div className="panel-header">
                <h3>System Users</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Total registered: {usersList.length}
                </span>
              </div>

              {userListError && (
                <div className="error-banner">
                  <AlertTriangle size={18} />
                  <span>{userListError}</span>
                </div>
              )}

              {loadingUsers ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <span>Loading directory details...</span>
                </div>
              ) : (
                <div className="table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr._id}>
                          <td>
                            <div className="user-cell-name">{usr.name} {usr._id === user?._id && '(You)'}</div>
                            <div className="user-cell-email">{usr.email}</div>
                          </td>
                          <td>
                            <span className={`profile-role-badge role-${usr.role}`}>
                              {usr.role}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteUser(usr._id, usr.name)}
                              className="btn-icon"
                              title={usr._id === user?._id ? "Delete your own account" : "Delete user"}
                              style={{ color: '#f87171' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem' }}>
              <Shield size={48} style={{ color: '#818cf8', marginBottom: '1.5rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Welcome to your Dashboard, {user?.name}!</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px' }}>
                You have successfully authenticated. From this panel, you can update your personal information or manage your account using the profile card on the left.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
