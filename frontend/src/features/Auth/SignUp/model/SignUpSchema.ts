import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const passwordRegex = new RegExp(
  /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/,
);

export const SignUpSchema = z
  .object({
    email: z
      .string()
      .nonempty('이메일을 입력해주세요.')
      .email('잘못된 이메일 형식입니다.'),
    name: z
      .string()
      .nonempty('이름을 입력해주세요.')
      .min(2, { message: '이름은 최소 2글자 이상입니다.' }),
    password: z
      .string()
      .nonempty('비밀번호를 입력해주세요.')
      .min(6, { message: '비밀번호는 최소 6자 이상입니다.' })
      .max(10, { message: '비밀번호는 최대 10자 입니다.' })
      .regex(
        passwordRegex,
        '소문자, 숫자, 특수문자가 최소 1개 이상이 포함되어야 합니다.',
      ),
    confirmPassword: z.string().nonempty('비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export const SignUp = () => {
  const method = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  return { method };
};
