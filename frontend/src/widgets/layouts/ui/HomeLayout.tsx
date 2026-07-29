import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import ProtectedRoute from './ProtectedRoute';

const HomeLayout = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full justify-center overflow-y-auto lg:block lg:h-auto">
        <Outlet />
      </div>
      <NavBar />
    </ProtectedRoute>
  );
};

export default HomeLayout;
