import { Link } from 'react-router-dom';
import { usePathName } from '../hooks/NavBarHook';
import { NavBarConstants } from '../constants/NavBarConstants';
import useReserveModalStore from '@/widgets/model/ReserveStore';
import useNotifiModalStore from '@/widgets/model/Notification';

const NavBar = () => {
  const { location } = usePathName();
  const isReserveShow = useReserveModalStore((state) => state.isShow);
  const isNotifiShow = useNotifiModalStore((state) => state.isShow);
  return (
    <div
      className={`fixed lg:!hidden ${isReserveShow || isNotifiShow === true ? 'hidden' : ''} bottom-0 left-1/2 flex h-20 w-[376px] -translate-x-1/2 items-center justify-around rounded-t-3xl border-l-0 border-r-0 border-t border-lightGray bg-white shadow-lg`}
    >
      {NavBarConstants().map(({ on_icon, off_icon, text, path }, idx) => {
        const isActive = location.pathname === path;
        return (
          <Link
            to={path}
            className="flex flex-col items-center gap-y-1"
            key={idx}
          >
            <div
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all ${isActive ? 'bg-lightBlue' : ''}`}
            >
              <img width={24} height={24} src={isActive ? on_icon : off_icon} />
            </div>
            <span
              className={`${isActive ? 'text-black' : 'text-mediumGray'} text-xs font-bold`}
            >
              {text}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default NavBar;
