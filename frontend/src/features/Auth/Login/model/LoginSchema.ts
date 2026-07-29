import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const passwordRegex = new RegExp(
  /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/,
);

export const LoginSchema = z.object({
  email: z
    .string()
    .nonempty('이메일을 입력해주세요.')
    .email('잘못된 이메일 형식입니다.'),
  password: z
    .string()
    .nonempty('비밀번호를 입력해주세요.')
    .min(6, { message: '비밀번호는 최소 6자 이상입니다.' })
    .max(10, { message: '비밀번호는 최대 10자 입니다.' })
    .regex(
      passwordRegex,
      '소문자, 숫자, 특수문자가 최소 1개 이상이 포함되어야 합니다.',
    ),
});

export const Login = () => {
  const method = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  return { method };
};
