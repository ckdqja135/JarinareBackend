import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const PublicHomeLayout = () => {
  return (
    <>
      <div className="flex h-screen w-full justify-center overflow-y-auto lg:block lg:h-auto">
        <Outlet />
      </div>
      <NavBar />
    </>
  );
};

export default PublicHomeLayout;
