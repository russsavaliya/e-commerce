/**
 * User Auth Page
 * Container for user authentication (login/signup)
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from '../../components/user/auth/UserLogin';
import UserSignup from '../../components/user/auth/UserSignup';
import { ROUTES } from '../../utils/constants';
import { useUserAuth } from '../../context/UserAuthContext';

const UserAuthPage = () => {
  const { isAuthenticated } = useUserAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
  }

  return (
    <Routes>
      <Route path="login" element={<UserLogin />} />
      <Route path="signup" element={<UserSignup />} />
      <Route path="*" element={<Navigate to={ROUTES.USER_LOGIN} replace />} />
    </Routes>
  );
};

export default UserAuthPage;

