/**
 * @role: widgets — PC 팔로워/팔로잉 모달
 * @rule: 렌더링만 담당, 상태·로직 포함 금지
 */
import { getProfileColor } from '@/shared/lib/profileColor';
import { usePCFollowModal } from '../hooks/usePCFollowModal';
import { PCFollowModalProps, FollowModalTab } from '../types/followModalTypes';

const PCFollowModal = ({ followers, following, counts, initialTab, onClose }: PCFollowModalProps) => {
  const { tab, setTab, list, handleRemove } = usePCFollowModal(followers, following, initialTab);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <span className="text-lg font-black text-gray-900">팔로우 관리</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="mx-6 mb-4 flex gap-1 rounded-sm bg-gray-100 p-1">
          {(['followers', 'following'] as FollowModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-sm py-2 text-sm font-bold transition-colors ${
                tab === t
                  ? 'bg-white text-blue shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'followers' ? '팔로워' : '팔로잉'}
              <span className="ml-1 text-xs font-normal text-gray-400">
                {t === 'followers' ? counts.followers : counts.following}
              </span>
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="flex flex-col gap-2 overflow-y-auto px-6 pb-6" style={{ maxHeight: '360px' }}>
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-gray-400">
                {tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉하는 사람이 없습니다.'}
              </p>
            </div>
          ) : (
            list.map((entry) => (
              <div
                key={entry.uid}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: getProfileColor(entry.name) }}
                >
                  {entry.name.charAt(0)}
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-800">{entry.name}</span>
                <button
                  onClick={() => handleRemove(entry.uid)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-500 shadow-sm transition-colors hover:bg-red/10 hover:text-red"
                >
                  {tab === 'followers' ? 'x' : '팔로우 취소'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PCFollowModal;
