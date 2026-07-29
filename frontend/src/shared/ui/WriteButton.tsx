/**
 * @role: shared — 글쓰기 고정 버튼
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import edit from '@/assets/icons/edit.png';
import type { WriteButtonProps } from '@/shared/types/WriteButtonType';

const WriteButton = ({ onClick }: WriteButtonProps) => (
  <button
    onClick={onClick}
    className="fixed bottom-[92px] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-blue px-4 py-3 shadow-lg active:brightness-90"
  >
    <img src={edit} className="h-[16px] w-[16px] brightness-0 invert" />
    <span className="text-sm font-bold text-white">글쓰기</span>
  </button>
);

export default WriteButton;
