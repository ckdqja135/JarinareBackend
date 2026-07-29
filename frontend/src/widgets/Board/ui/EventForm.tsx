import cross from '@/assets/icons/cross.png';
import { useNavigate } from 'react-router-dom';
import picture from '@/assets/icons/picture.png';
import { BoardType } from '@/features/Board/types/boardType';

const EvnetForm = ({
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

export default EvnetForm;
