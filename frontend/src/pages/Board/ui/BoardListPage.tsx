import backward from '@/assets/icons/backward.png';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { Board } from '@/widgets/Board/ui/Board';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WriteButton from '@/shared/ui/WriteButton';
import PCBoardListPage from './PCBoardListPage';

const BoardListPage = () => {
  const navigate = useNavigate();
  const { markSeen } = useBoardSeen();

  useEffect(() => {
    markSeen('board');
  }, []);

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center bg-white px-[27px] py-4 shadow-sm">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="ml-4 text-lg font-bold">자유게시판</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-[80px]">
          <Board />
        </div>

        <WriteButton onClick={() => navigate('/board/board')} />
      </div>
    </>
  );
};

export default BoardListPage;
