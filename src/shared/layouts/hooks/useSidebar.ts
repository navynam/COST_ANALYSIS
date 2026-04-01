import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/AuthContext';

export const useSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // GitHub Pages 호환을 위해 hash router 방식으로 변경
    window.location.href = '/COST_ANALYSIS/#/login';
  };

  return { navigate, location, handleLogout };
};
