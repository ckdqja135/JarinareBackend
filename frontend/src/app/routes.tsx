import KakaoRedirect from '@/features/Auth/SocialLogin/ui/KakaoRedirect';
import LoginPage from '@/pages/Auth/Login/ui/LoginPage';
import SignUpPage from '@/pages/Auth/SignUp/ui/SignUpPage';
import BoardPage from '@/pages/Board/ui/BoardPage';
import BoardDetailPage from '@/pages/Board/ui/BoardDetailPage';
import BoardListPage from '@/pages/Board/ui/BoardListPage';
import BoardWirtePage from '@/pages/Board/ui/BoardWritePage';
import PCUnifiedWritePage from '@/pages/Board/ui/PCUnifiedWritePage';
import EventDetailPage from '@/pages/Board/ui/EventDetailPage';
import EventListPage from '@/pages/Board/ui/EventListPage';
import EventWirtePage from '@/pages/Board/ui/EventWritePage';
import PCNoticeDetailPage from '@/pages/Board/ui/PCNoticeDetailPage';
import NoticeListPage from '@/pages/Board/ui/NoticeListPage';
import NoticeWirtePage from '@/pages/Board/ui/NoticeWritePage';
import MenuPage from '@/pages/Menu/ui/MenuPage';
import MyPage from '@/pages/Mypage/ui/MyPage';
import NotificationPage from '@/pages/Notification/ui/NotificationPage';
import SeatChangePage from '@/pages/TicketChange/ui/SeatChangePage';
import TicketSeatChangePage from '@/pages/TicketChange/ui/TicketSeatChangePage';
import TicketViewPage from '@/pages/TicketChange/ui/TicketViewPage';
import TicketListPage from '@/pages/TicketList/ui/TicketListPage';
import HomePage from '@/pages/TicketReserve/ui/HomePage';
import SeatCheckPage from '@/pages/TicketReserve/ui/SeatCheckPage';
import TrainCheckPage from '@/pages/TicketReserve/ui/TrainCheckPage';
import SeatReturnPage from '@/pages/TicketReturn/ui/SeatReturnPage';
import TicketReturnPage from '@/pages/TicketReturn/ui/TicketReturnPage';
import PCTravelReviewPage from '@/pages/TravelReview/ui/PCTravelReviewPage';
import SettingPage from '@/pages/Set/ui/SettingPage';
import PCTravelReviewListPage from '@/pages/TravelReview/ui/PCTravelReviewListPage';
import Modal from '@/shared/ui/Modal';
import PCNotificationSidebar from '@/widgets/Notification/ui/PCNotificationSidebar';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import MainLayout from '@/widgets/layouts/ui/MainLayout';
import PublicHomeLayout from '@/widgets/layouts/ui/PublicHomeLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useModalRouteReset } from './hooks/useModalRouteReset';

const ModalRouteReset = () => {
  useModalRouteReset();

  return null;
};

const Router = () => {
  return (
    <BrowserRouter>
      <ModalRouteReset />
      <div className="relative w-full">
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/oauth/kakao/callback" element={<KakaoRedirect />} />
          {/* 로그인 불필요 */}
          <Route element={<PublicHomeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/board/noticelist" element={<NoticeListPage />} />
            <Route path="/board/eventlist" element={<EventListPage />} />
            <Route path="/board/boardlist" element={<BoardListPage />} />
            <Route path="/board/notice/detail" element={<PCNoticeDetailPage />} />
            <Route path="/board/event/detail" element={<EventDetailPage />} />
            <Route path="/board/board/detail" element={<BoardDetailPage />} />
            <Route path="/reserve/traincheck" element={<TrainCheckPage />} />
            <Route path="/reserve/seatcheck" element={<SeatCheckPage />} />
          </Route>
          {/* 로그인 필수 */}
          <Route element={<HomeLayout />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="/ticketlist" element={<TicketListPage />} />
            <Route path="/returnlist" element={<TicketReturnPage />} />
            <Route path="/reserve/notification" element={<NotificationPage />} />
            <Route path="/travel/review/list" element={<PCTravelReviewListPage />} />
            <Route path="/travel/review" element={<PCTravelReviewPage />} />
            <Route path="/board/notice" element={<NoticeWirtePage />} />
            <Route path="/board/event" element={<EventWirtePage />} />
            <Route path="/board/board" element={<BoardWirtePage />} />
            <Route path="/board/write" element={<PCUnifiedWritePage />} />
          </Route>
          <Route path="/ticket/view" element={<TicketViewPage />} />
          <Route element={<MainLayout />}>
            <Route
              path="/ticket/seatchange"
              element={<TicketSeatChangePage />}
            />
            <Route path="/seatchange" element={<SeatChangePage />} />
            <Route path="/return" element={<SeatReturnPage />} />
          </Route>
        </Routes>
        <Modal />
        <PCNotificationSidebar />
      </div>
    </BrowserRouter>
  );
};

export default Router;
