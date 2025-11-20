import { Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  return children;
};

export const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('user_token');

  if (!token) {
    return <Navigate to={ROUTES.USER_LOGIN} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

