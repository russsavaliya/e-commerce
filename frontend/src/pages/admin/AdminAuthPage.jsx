import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../../components/admin/auth/AdminLogin';
import { ROUTES } from '../../utils/constants';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminAuthPage = () => {
  const { isAuthenticated } = useAdminAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="*" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
    </Routes>
  );
};

export default AdminAuthPage;

