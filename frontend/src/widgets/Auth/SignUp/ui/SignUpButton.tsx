import { LoadingStore } from '@/features/Auth/SignUp/model/SignUpStore';
import { ButtonProps } from '@/shared/types/ButtonType';

const SignUpButton = ({ bgColor, textColor, text }: ButtonProps) => {
  const { isLoading } = LoadingStore();
  return (
    <div className="mb-[45px] flex flex-col gap-y-5">
      <button
        disabled={isLoading}
        type="submit"
        className={`relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-${bgColor} text-base font-bold text-${textColor} shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50`}
      >
        {text}
      </button>
    </div>
  );
};

export default SignUpButton;
