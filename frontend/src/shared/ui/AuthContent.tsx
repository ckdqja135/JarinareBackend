import { AuthContentsProps } from '../types/AuthType';
import AuthInput from './AuthInput';

const AuthContent = ({
  subtitle,
  placeholder,
  name,
  type,
}: AuthContentsProps) => {
  return (
    <div className="mt-[45px]">
      <div className="mt-[40px]">
        <span className="text-tiny font-bold">{subtitle}</span>
        {'성별 / 나이대' !== subtitle ? (
          <AuthInput type={type} name={name} placeholder={placeholder} />
        ) : null}
      </div>
    </div>
  );
};

export default AuthContent;
