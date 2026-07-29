import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';

const NameForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex h-full flex-col gap-y-3">
      <AuthContent
        type="text"
        subtitle="이름"
        placeholder="이름"
        name={register('name')}
      />
      <span className="animate-bounce text-base font-bold text-red">
        {/* 이름 에러 발생 시에만 에러 메세지 생성 */}
        {errors.name == undefined ? null : String(errors.name?.message)}
      </span>
    </div>
  );
};

export default NameForm;
