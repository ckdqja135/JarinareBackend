import { AuthInputProps } from '../types/AuthType';

const AuthInput = ({ placeholder, name, type }: AuthInputProps) => {
  return (
    <>
      <input
        {...name}
        type={type}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-[300px] items-center justify-center rounded-sm bg-white px-[15px] text-tiny font-bold text-lightGray"
      />
    </>
  );
};

export default AuthInput;
