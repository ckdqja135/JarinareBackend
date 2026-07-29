/**
 * @role: widgets — 자유게시판 모바일 글 작성 폼
 * @rule: 렌더링만 담당, 상태·로직 포함 금지
 */
import cross from '@/assets/icons/cross.png';
import { useNavigate } from 'react-router-dom';
import picture from '@/assets/icons/picture.png';
import { BoardType } from '@/features/Board/types/boardType';

const BoardForm = ({
  onAuthorChange,
  onContentChange,
  onTitleChange,
  onFileChange,
  onSubmit,
  setFile,
  setPreviewImg,
  fileInputRef,
  author,
  title,
  content,
  previewImg,
  tags,
  tagInput,
  onTagInputChange,
  onTagInputKeyDown,
  onRemoveTag,
}: BoardType) => {
  const navigate = useNavigate();
  return (
    <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
      <input
        value={author}
        onChange={onAuthorChange}
        type="text"
        required
        placeholder="작성자"
        className="rounded-xl bg-white px-4 py-3 text-base shadow-sm placeholder:text-lightGray focus:outline-none"
      />
      <input
        value={title}
        onChange={onTitleChange}
        type="text"
        required
        placeholder="제목"
        className="rounded-xl bg-white px-4 py-3 text-base shadow-sm placeholder:text-lightGray focus:outline-none"
      />
      <textarea
        value={content}
        onChange={onContentChange}
        required
        placeholder="내용"
        className="h-[120px] resize-none rounded-xl bg-white px-4 py-3 text-base shadow-sm placeholder:text-lightGray focus:outline-none"
      />
      <div>
        <div className="flex justify-end">
          <label
            htmlFor="file"
            className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-lightGray bg-white p-2 shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
          >
            <span className="text-base text-lightGray">사진 첨부</span>
            <img src={picture} />
          </label>
          <input
            onChange={onFileChange}
            ref={fileInputRef}
            id="file"
            type="file"
            className="hidden border border-lightGray"
          />
        </div>
        <div className="relative">
          {previewImg ? (
            <img
              src={previewImg}
              alt="미리보기 이미지"
              className="h-[100px] w-[100px] rounded-md border border-lightGray"
            />
          ) : null}
          {previewImg ? (
            <div
              onClick={() => {
                setFile(null);
                setPreviewImg(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute bottom-20 left-20 flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)] transition-opacity duration-300 ease-out"
            >
              <img src={cross} width={15} height={15} />
            </div>
          ) : null}
        </div>
      </div>
      {/* 태그 */}
      {tags !== undefined && (
        <div className="flex flex-col gap-2">
          <input
            value={tagInput}
            onChange={onTagInputChange}
            onKeyDown={onTagInputKeyDown}
            placeholder="태그는 최대 5개까지 입력 가능해요 (Enter로 추가)"
            className="rounded-xl bg-white px-4 py-3 text-base shadow-sm placeholder:text-lightGray focus:outline-none"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag?.(tag)}
                    className="ml-0.5 text-gray-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-[100px] flex justify-between gap-5">
        <button
          type="button"
          onClick={() => navigate('/board')}
          className="h-12 w-[200px] rounded-xl border border-lightGray bg-lightBlue text-base font-bold text-blue shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
        >
          취소
        </button>
        <button className="h-12 w-[200px] rounded-xl border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95">
          작성 완료
        </button>
      </div>
    </form>
  );
};

export default BoardForm;
