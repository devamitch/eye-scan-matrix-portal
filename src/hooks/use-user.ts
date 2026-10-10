
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useFormMutation } from './use-api';
import { UserLoginSchema, UserRegisterSchema } from '@/lib/schema/user';
import useAppStore from '@/store';
// Create Admin
export const useRegisterUser = () => {
	const router = useRouter();
	const register=useAppStore((state) => state.auth.register);

	return useFormMutation(
		UserRegisterSchema,
		async (data: Record<string, unknown>) => {
			const { email, password, name, role } = data as { email: string; password: string; name: string; role: "ADMIN" | "USER" };
			await register(email, password, name, role);
		},
		{
			onSuccess: () => {
				router.push('/signin');
			},
		}
	);
};

// Login Admin
export const useLogin = () => {
	const router = useRouter();
	const login =useAppStore((state) => state.auth.login);
const { startScreenTime } = useAppStore((state) => state?.screenTime);
	return useFormMutation(
		UserLoginSchema,
		async (data: Record<string, unknown>) => {
			const { email, password } = data as { email: string; password: string };
			await login(email, password);
		},
		{
			mode: 'onSubmit',
			reValidateMode: 'onSubmit',
			onSuccess: () => {
				startScreenTime();
				toast.success('Login successful');
				router.push('/dashboard');
			},
			onError: (error: any) => {				
				toast.error(error.response?.data?.message || 'Login failed');
			},
		}
	);
};