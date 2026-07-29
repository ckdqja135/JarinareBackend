import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const MainLayout = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

export default MainLayout;
