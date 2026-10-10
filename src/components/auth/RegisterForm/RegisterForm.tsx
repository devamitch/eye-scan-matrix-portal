'use client';

import { auth } from '@/constants/firebase';
import useTranslationData from '@/hooks/use-translation-data';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import styles from './RegisterForm.module.css';

import { useRegisterUser } from '@/hooks/use-user';
import { Apple, ChevronLeft, Eye, EyeOff, X } from 'lucide-react';
// import { useRouter } from '@/i18n/navigation'
export default function RegisterForm() {
	const { registerFormText } = useTranslationData();

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		acceptTerms: false,
	});
	const { form, mutation, onSubmit } = useRegisterUser();
	useEffect(() => {
  form.setValue('role', 'USER');
  if(form.getValues('password')!==formData.confirmPassword){
	form.setError('password', { type: 'manual', message: 'Passwords do not match' });
  }
}, [form]);

	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const clearField = (fieldName: string) => {
		setFormData((prev) => ({
			...prev,
			[fieldName]: '',
		}));
	};

	const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
		if (field === 'password') {
			setShowPassword(!showPassword);
		} else {
			setShowConfirmPassword(!showConfirmPassword);
		}
	};

	const validateForm = () => {
		if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
			// setError(registerFormText.validationErrors.allFieldsRequired);
			return false;
		}

	}
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<ChevronLeft 
					size={36} 
					className={styles.chevron} 
					onClick={() => router.back()}
					style={{ cursor: 'pointer' }}
				/>
				<h2 className={styles.title}>{registerFormText.title}</h2>
				<div className={styles.placeholder} />
			</div>
			<div className={styles.formWrapper}>
				<div className={styles.welcomeHeader}>
					<h2 className={styles.welcomeTitle}>{registerFormText.title}</h2>
					<p className={styles.subtitle}>{registerFormText.subtitle}</p>
				</div>

				<form onSubmit={onSubmit} className={styles.form}>
					<div className={styles.inputGroup}>
						<label htmlFor="name" className={styles.label}>
							{registerFormText.nameLabel}
						</label>
						<div className={styles.inputWrapper}>
							<input
								id="name"
								
								type="text"
								
								placeholder={registerFormText.namePlaceholder}
								required
								className={styles.input}
								disabled={isLoading}
								{...form.register('name')}
							/>
							{formData.name && (
								<button
									type="button"
									className={styles.inputIcon}
									onClick={() => clearField('name')}
									disabled={isLoading}
								>
									<X size={16} />
								</button>
							)}
						</div>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor="email" className={styles.label}>
							{registerFormText.emailLabel}
						</label>
						<div className={styles.inputWrapper}>
							<input
								id="email"
								type="email"
								
								placeholder={registerFormText.emailPlaceholder}
								required
								className={styles.input}
								disabled={isLoading}
								{...form.register('email')}
							/>
							{formData.email && (
								<button
									type="button"
									className={styles.inputIcon}
									onClick={() => clearField('email')}
									disabled={isLoading}
								>
									<X size={20} />
								</button>
							)}
						</div>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor="password" className={styles.label}>
							{registerFormText.passwordLabel}
						</label>
						<div className={styles.inputWrapper}>
							<input
								id="password"
								
								type={showPassword ? "text" : "password"}
								
								placeholder={registerFormText.passwordPlaceholder}
								required
								className={styles.input}
								disabled={isLoading}
								{...form.register('password')}
							/>
							<button
								type="button"
								className={styles.inputIcon}
								onClick={() => togglePasswordVisibility('password')}
								disabled={isLoading}
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor="confirmPassword" className={styles.label}>
							{registerFormText.confirmPasswordLabel}
						</label>
						<div className={styles.inputWrapper}>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder={registerFormText.confirmPasswordPlaceholder}
								required
								className={styles.input}
								disabled={isLoading}
							/>
							<button
								type="button"
								className={styles.inputIcon}
								onClick={() => togglePasswordVisibility('confirmPassword')}
								disabled={isLoading}
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<div className={styles.checkboxGroup}>
						<input
							id="acceptTerms"
							name="acceptTerms"
							type="checkbox"
							checked={formData.acceptTerms}
							onChange={handleChange}
							className={styles.checkbox}
							disabled={isLoading}
						/>
						<label htmlFor="acceptTerms" className={styles.checkboxLabel}>
							{registerFormText.termsCheckboxText}{' '}
							<Link href="/terms" className={styles.link}>
								{registerFormText.termsLinkText}
							</Link>{' '}
							{registerFormText.andText}{' '}
							<Link href="/privacy" className={styles.link}>
								{registerFormText.privacyLinkText}
							</Link>
						</label>
					</div>

					{/* {error && <div className={styles.error}>{error}</div>} */}

					{successMessage && <div className={styles.success}>{successMessage}</div>}
					<button
						type="submit"
						className={`${styles.button} ${(mutation.isPending || isLoading) ? styles.buttonLoading : ''}`}
						
						disabled={mutation.isPending||isLoading}
					>
						{isLoading ||mutation.isPending ? (
							<>
								<span className={styles.spinner}></span>
								{registerFormText.loadingButtonText}
							</>
						) : (
							registerFormText.submitButtonText
						)}
					</button>
					<div className={styles.socialDivider}>
						<div className={styles.dividerLine}></div>
						<span className={styles.dividerText}>{registerFormText.socialDividerText}</span>
						<div className={styles.dividerLine}></div>
					</div>

					<button
						type="button"
						className={styles.socialButton}
						disabled={isLoading}
						onClick={() => {
							// Implement Apple login
							console.log('Apple signup clicked');
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
								{registerFormText.continueWithApple}
					</button>
					    
				</form>
				<div className={styles.linkContainer}>
						{registerFormText.signInLinkText}{' '}
						<Link href="/signin" className={styles.link}>
							{registerFormText.signInText}
						</Link>
					</div>
			</div>
		</div>
	);
}
