'use client';

import { auth } from '@/constants/firebase';
import useTranslationData from '@/hooks/use-translation-data';
import { Link, useRouter } from '@/i18n/navigation';
import useAppStore from '@/store';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import styles from './LoginForm.module.css';

import { ChevronLeft, Eye, EyeOff, X } from 'lucide-react';

import { LoginFormValues } from '@/lib/validations/auth';
import { useForm } from 'react-hook-form';
import { useLogin } from '@/hooks/use-user';

export default function LoginForm() {
	const { loginFormText, camScreenText } = useTranslationData();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>();

	const loginMutation = useLogin();

	const onSubmit = (values: LoginFormValues) => {
		loginMutation.mutate(values);
	};
	const [error, setError] = useState({ type: '', message: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [showResetForm, setShowResetForm] = useState(false);
	const [resetEmail, setResetEmail] = useState('');
	const router = useRouter();
	const { startScreenTime } = useAppStore((state) => state?.screenTime);

	const validateForm = () => {
		if (!formData.email || !formData.password) {
			setError({
				type: 'empty_fields',
				message: loginFormText.validationErrors.emptyFields,
			});
			return false;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			setError({
				type: 'invalid_email',
				message: loginFormText.validationErrors.invalidEmail,
			});
			return false;
		}

		return true;
	};

	
	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError({ type: '', message: '' });

		if (!resetEmail) {
			setError({
				type: 'reset_empty_email',
				message: loginFormText.validationErrors.emptyFields,
			});
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
			setError({
				type: 'reset_invalid_email',
				message: loginFormText.validationErrors.invalidEmail,
			});
			return;
		}

		setIsLoading(true);

		try {
			await sendPasswordResetEmail(auth, resetEmail);
			setSuccessMessage(loginFormText.resetSuccessMessage);
			setShowResetForm(false);
			setResetEmail('');
		} catch (err: any) {
			console.error('Password reset error:', err);

			if (err.code === 'auth/user-not-found') {
				setError({
					type: 'reset_user_not_found',
					message: loginFormText.firebaseErrors.userNotFound,
				});
			} else {
				setError({
					type: 'reset_failed',
					message: camScreenText.retryButton,
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<ChevronLeft
					size={36}
					className={styles.chevron}
					onClick={() => router.push('/')}
					style={{ cursor: 'pointer' }}
				/>
				<h2 className={styles.title}>{loginFormText.signInButton}</h2>
				<div className={styles.placeholder} />
			</div>
			<div className={styles.formWrapper}>
				<div className={styles.welcomeHeader}>
					<h2 className={styles.WelcomeTitle}>{loginFormText.title}</h2>
					<p className={styles.subtitle}>{loginFormText.subtitle}</p>
				</div>

				{!showResetForm ? (
					<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
						<div className={styles.inputGroup}>
							<label htmlFor="email" className={styles.label}>
								{loginFormText.emailLabel}
							</label>
							<input
								id="email"
								type="email"
								placeholder={loginFormText.emailPlaceholder}
								required
								className={`${styles.input} ${error.type.includes('email') ? styles.inputError : ''}`}
								disabled={isLoading}
								{...register('email', { required: true })}
							/>
							{error.type.includes('email') && (
								<div className={styles.fieldErrorIndicator}>
									<span>⚠️</span>
								</div>
							)}
						</div>
						<div className={styles.inputGroup}>
							<label htmlFor="password" className={styles.label}>
								{loginFormText.passwordLabel}
							</label>
							<input
								id="password"
								type="password"
								placeholder={loginFormText.passwordPlaceholder}
								required
								className={`${styles.input} ${error.type.includes('password') ? styles.inputError : ''}`}
								disabled={isLoading}
								{...register('password', {required: true})}
								
							/>
							{error.type.includes('password') && (
								<div className={styles.fieldErrorIndicator}>
									<span>⚠️</span>
								</div>
							)}
						</div>
						{/* <div className={styles.forgotPassword}>
							<button
								type="button"
								onClick={() => setShowResetForm(true)}
								className={styles.forgotLink}
								disabled={isLoading}
							>
								{loginFormText.forgotPasswordText}
							</button>
						</div> */}
						<button
							type="submit"
							className={`${styles.button} ${isLoading || loginMutation.isPending ? styles.buttonLoading : ''}`}
							disabled={isLoading || loginMutation.isPending}
						>
							{loginMutation.isPending || isLoading ? (
								<>
									<span className={styles.spinner}></span>
									{loginFormText.loadingButtonText}
								</>
							) : (
								loginFormText.signInButton
							)}
						</button>
						<div className={styles.socialDivider}>
							<div className={styles.dividerLine}></div>
							<span className={styles.dividerText}>
								{loginFormText.socialDividerText}
							</span>
							<div className={styles.dividerLine}></div>
						</div>{' '}
						<button
							className={styles.socialButton}
							disabled={isLoading}
							onClick={() => {
								// Implement Apple login
								console.log('Apple login clicked');
							}}
						>
							<svg 
									width="24" 
									height="24" 
									fill="var(--metricValue)" 
									viewBox="0 0 24 24" 
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
								</svg>
              {loginFormText.continueWithApple}
						</button>
						<div className={styles.linkContainer}>
							{loginFormText.createAccountText}{' '}
							<Link href="/register" className={styles.link}>
								{loginFormText.createAccountLink}
							</Link>
						</div>
						{error.message && (
							<div className={styles.error}>
								<div className={styles.errorContent}>
									<div className={styles.errorTitle}>
										{error.type === 'user_not_found' &&
											loginFormText.firebaseErrors.userNotFound}
										{error.type === 'wrong_password' &&
											loginFormText.firebaseErrors.wrongPassword}
										{error.type === 'invalid_credentials' &&
											loginFormText.firebaseErrors.invalidCredentials}
										{error.type === 'invalid_email' &&
											loginFormText.firebaseErrors.invalidEmailFormat}
										{error.type === 'invalid_email_format' &&
											loginFormText.firebaseErrors.invalidEmailFormat}
										{error.type === 'account_disabled' &&
											loginFormText.firebaseErrors.accountDisabled}
										{error.type === 'too_many_attempts' &&
											loginFormText.firebaseErrors.tooManyAttempts}
										{error.type === 'network_error' &&
											loginFormText.firebaseErrors.networkError}
										{error.type === 'empty_fields' &&
											loginFormText.validationErrors.emptyFields}
										{![
											'user_not_found',
											'wrong_password',
											'invalid_credentials',
											'invalid_email',
											'invalid_email_format',
											'account_disabled',
											'too_many_attempts',
											'network_error',
											'empty_fields',
										].includes(error.type) &&
											loginFormText.firebaseErrors.configurationError}
									</div>
								</div>
							</div>
						)}
						{successMessage && (
							<div className={styles.success}>
								<div className={styles.successContent}>
									<div className={styles.successTitle}>{successMessage}</div>
								</div>
							</div>
						)}
						{/* <div className={styles.linkContainer}>
							{loginFormText.createAccountText}{' '}
							<Link href="/register" className={styles.link}>
								{loginFormText.createAccountLink}
							</Link>
						</div> */}
					</form>
				) : (
					<form onSubmit={handlePasswordReset} className={styles.form}>
						<h2 className={styles.resetTitle}>{loginFormText.resetTitle}</h2>
						<p className={styles.resetSubtitle}>{loginFormText.resetSubtitle}</p>

						<div className={styles.inputGroup}>
							<label htmlFor="resetEmail" className={styles.label}>
								{loginFormText.emailLabel}
							</label>
							<input
								id="resetEmail"
								name="resetEmail"
								type="email"
								value={resetEmail}
								onChange={(e) => setResetEmail(e.target.value)}
								placeholder={loginFormText.emailPlaceholder}
								required
								className={`${styles.input} ${error.type.includes('reset') ? styles.inputError : ''}`}
								disabled={isLoading}
							/>
							{error.type.includes('reset') && (
								<div className={styles.fieldErrorIndicator}>
									<span>⚠️</span>
								</div>
							)}
						</div>

						<div className={styles.resetActions}>
							<button
								type="submit"
								className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<span className={styles.spinner}></span>
										{loginFormText.resetLoadingText}
									</>
								) : (
									loginFormText.sendResetButton
								)}
							</button>

							<button
								type="button"
								onClick={() => {
									setShowResetForm(false);
									setError({ type: '', message: '' });
								}}
								className={styles.secondaryButton}
								disabled={isLoading}
							>
								{loginFormText.backToLoginButton}
							</button>
						</div>

						{/* {error.message && error.type.includes('reset') && (
							<div className={styles.error}>
								<div className={styles.errorIcon}>⚠️</div>
								<div className={styles.errorContent}>
									<div className={styles.errorTitle}>
										{error.type === 'reset_user_not_found' &&
											loginFormText.firebaseErrors.userNotFound}
										{error.type === 'reset_empty_email' &&
											loginFormText.errorTitles.emailRequired}
										{error.type === 'reset_invalid_email' &&
											loginFormText.errorTitles.invalidEmail}
										{error.type === 'reset_failed' &&
											loginFormText.errorTitles.resetFailed}
									</div>
									<div className={styles.errorMessage}>{error.message}</div>
								</div>
							</div>
						)} */}

						{successMessage && (
							<div className={styles.success}>
								<div className={styles.successIcon}>✅</div>
								<div className={styles.successContent}>
									<div className={styles.successTitle}>
										{loginFormText.resetSuccessTitle}
									</div>
									<div className={styles.successMessage}>{successMessage}</div>
								</div>
							</div>
						)}
					</form>
				)}
			</div>
		</div>
	);
}
