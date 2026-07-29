/**
 * @role: widgets/layouts — ui
 * @rule: 렌더링만 담당, PCTopNav+PCSidebar+LoginRequiredBlock 조합
 */
import PCTopNav from './PCTopNav';
import PCSidebar from './PCSidebar';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

interface Props {
  description?: string;
  onLogin: () => void;
}

const PCLoginRequiredPage = ({ description, onLogin }: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-gray-50">
    <PCTopNav />
    <div className="flex w-full flex-1 gap-0">
      <PCSidebar />
      <main
        className="flex min-w-0 flex-1 items-center justify-center"
        style={{ height: 'calc(100vh - 3.5rem)' }}
      >
        <LoginRequiredBlock
          description={description}
          onLogin={onLogin}
          size="lg"
        />
      </main>
    </div>
  </div>
);

export default PCLoginRequiredPage;
