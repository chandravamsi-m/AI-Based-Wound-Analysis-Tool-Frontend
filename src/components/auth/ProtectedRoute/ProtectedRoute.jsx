/**
 * Protected Route Component
 * Restricts access based on authentication and role
 */

import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

function ProtectedRoute({ children, requiredRole = null }) {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole) {
    const hasPermission = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasPermission) {
      return (
        <div className="access-denied">
          <div className="access-denied-content">
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <p>Required role: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}</p>
            <p>Your role: {userRole}</p>
            <button onClick={() => window.history.back()}>Go Back</button>
          </div>
        </div>
      );
    }
  }

  return children;
}

export default ProtectedRoute;
